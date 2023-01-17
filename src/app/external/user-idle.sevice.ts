/*
MIT License

Copyright (c) 2020 Vasyl Efimenko, rednez@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
This code was contributed by Vasyl Yefimenko from the GitHub repository
https://github.com/rednez/angular-user-idle

The source code has been included as-is (apart from minor changes to build) into this
repo because the angular-user-idle npm package only targets up to Angular 12, whereas this
repo targets Angular 14 and above. Also, the GitHub repo no longer looks maintained.

Because of conflicting peer dependencies and lack of updates, the source is therefore built
directly into this application to support user idle inactivity in the app.
*/

import { Inject, Injectable, InjectionToken, NgZone, Optional } from '@angular/core';
import {
  bufferTime,
  distinctUntilChanged,
  filter,
  finalize,
  from,
  fromEvent,
  interval,
  map,
  merge,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
  timer,
} from 'rxjs';

export class UserIdleConfiguration {
  /**
   * Idle value in seconds.
   */
  idle?: number;
  /**
   * Timeout value in seconds.
   */
  timeout?: number;
  /**
   * Ping value in seconds.
   */
  ping?: number;
  /**
   * IdleSensitivity time that activity must remain below the idle detection threshold before
   * idle buffer timer count user's activity actions, in seconds.
   */
  idleSensitivity?: number;
}

export const USER_IDLE_CONFIGURATION = new InjectionToken<UserIdleConfiguration>(
  'UserIdleConfiguration'
);

@Injectable({
  providedIn: 'root',
})
export class UserIdleService {
  ping$?: Observable<any>;

  /**
   * Events that can interrupts user's inactivity timer.
   */
  protected activityEvents$?: Observable<any>;

  private timerStart$ = new Subject<boolean>();
  protected idleDetected$ = new Subject<boolean>();
  protected timeout$ = new Subject<boolean>();
  protected idle$?: Observable<any>;
  protected timer$?: Observable<any>;

  /**
   * Idle value in milliseconds.
   * Default equals to 10 minutes.
   */
  protected idleMillisec = 600 * 1000;

  /**
   * Idle buffer wait time milliseconds to collect user action
   * Default equals to 1 Sec.
   */
  protected idleSensitivityMillisec = 1000;

  /**
   * Timeout value in seconds.
   * Default equals to 5 minutes.
   */
  protected timeout = 300;

  /**
   * Ping value in milliseconds.
   * Default equals to 2 minutes.
   */
  protected pingMillisec = 120 * 1000;

  /**
   * Timeout status.
   */
  protected isTimeout = false;

  /**
   * Timer of user's inactivity is in progress.
   */
  protected isInactivityTimer = false;
  protected isIdleDetected = false;
  protected idleSubscription?: Subscription;

  constructor(
    @Optional() @Inject(USER_IDLE_CONFIGURATION) config: UserIdleConfiguration,
    private ngZone: NgZone
  ) {
    if (config) {
      this.setConfig(config);
    }
  }

  /**
   * Start watching for user idle and setup timer and ping.
   */
  startWatching() {
    if (!this.activityEvents$) {
      this.activityEvents$ = merge(
        fromEvent(window, 'mousemove'),
        fromEvent(window, 'resize'),
        fromEvent(document, 'keydown')
      );
    }

    this.idle$ = from(this.activityEvents$);

    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }

    // If any of user events is not active for idle-seconds when start timer.
    this.idleSubscription = this.idle$
      .pipe(
        bufferTime(this.idleSensitivityMillisec), // Starting point of detecting of user's inactivity
        filter((arr) => !arr.length && !this.isIdleDetected && !this.isInactivityTimer),
        tap(() => {
          this.isIdleDetected = true;
          this.idleDetected$.next(true);
        }),
        switchMap(() =>
          this.ngZone.runOutsideAngular(() =>
            interval(1000).pipe(
              takeUntil(
                merge(
                  this.activityEvents$!,
                  timer(this.idleMillisec).pipe(
                    tap(() => {
                      this.isInactivityTimer = true;
                      this.timerStart$.next(true);
                    })
                  )
                )
              ),
              finalize(() => {
                this.isIdleDetected = false;
                this.idleDetected$.next(false);
              })
            )
          )
        )
      )
      .subscribe();

    this.setupTimer(this.timeout);
    this.setupPing(this.pingMillisec);
  }

  stopWatching() {
    this.stopTimer();
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }
  }

  stopTimer() {
    this.isInactivityTimer = false;
    this.timerStart$.next(false);
  }

  resetTimer() {
    this.stopTimer();
    this.isTimeout = false;
  }

  /**
   * Return observable for timer's countdown number that emits after idle.
   */
  onTimerStart(): Observable<number> {
    return this.timerStart$.pipe(
      distinctUntilChanged(),
      switchMap((start) => (start && this.timer$ ? this.timer$ : of(null)))
    );
  }

  /**
   * Return observable for idle status changed
   */
  onIdleStatusChanged(): Observable<boolean> {
    return this.idleDetected$.asObservable();
  }

  /**
   * Return observable for timeout is fired.
   */
  onTimeout(): Observable<boolean> {
    return this.timeout$.pipe(
      filter((timeout) => !!timeout),
      tap(() => (this.isTimeout = true)),
      map(() => true)
    );
  }

  getConfigValue(): UserIdleConfiguration {
    return {
      idle: this.idleMillisec / 1000,
      idleSensitivity: this.idleSensitivityMillisec / 1000,
      timeout: this.timeout,
      ping: this.pingMillisec / 1000,
    };
  }

  /**
   * Set config values.
   *
   * @param config
   */
  setConfigValues(config: UserIdleConfiguration) {
    if (this.idleSubscription && !this.idleSubscription.closed) {
      console.error('Call stopWatching() before set config values');
      return;
    }

    this.setConfig(config);
  }

  private setConfig(config: UserIdleConfiguration) {
    if (config.idle) {
      this.idleMillisec = config.idle * 1000;
    }
    if (config.ping) {
      this.pingMillisec = config.ping * 1000;
    }
    if (config.idleSensitivity) {
      this.idleSensitivityMillisec = config.idleSensitivity * 1000;
    }
    if (config.timeout) {
      this.timeout = config.timeout;
    }
  }

  /**
   * Set custom activity events
   *
   * @param customEvents Example: merge(
   *   fromEvent(window, 'mousemove'),
   *   fromEvent(window, 'resize'),
   *   fromEvent(document, 'keydown'),
   *   fromEvent(document, 'touchstart'),
   *   fromEvent(document, 'touchend')
   * )
   */
  setCustomActivityEvents(customEvents: Observable<any>) {
    if (this.idleSubscription && !this.idleSubscription.closed) {
      console.error('Call stopWatching() before set custom activity events');
      return;
    }

    this.activityEvents$ = customEvents;
  }

  /**
   * Setup timer.
   *
   * Counts every seconds and return n+1 and fire timeout for last count.
   *
   * @param timeout Timeout in seconds.
   */
  protected setupTimer(timeout: number) {
    this.ngZone.runOutsideAngular(() => {
      this.timer$ = of(() => new Date()).pipe(
        map((fn) => fn()),
        switchMap((startDate) =>
          interval(1000).pipe(
            map(() => Math.round((new Date().valueOf() - startDate.valueOf()) / 1000)), //   convert elapsed count to seconds
            tap((elapsed) => {
              if (elapsed >= timeout) {
                this.timeout$.next(true);
              }
            })
          )
        )
      );
    });
  }

  /**
   * Setup ping.
   *
   * Pings every ping-seconds only if is not timeout.
   *
   * @param pingMillisec
   */
  protected setupPing(pingMillisec: number) {
    this.ping$ = interval(pingMillisec).pipe(filter(() => !this.isTimeout));
  }
}