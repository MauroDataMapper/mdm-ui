import { Directive, Input, ElementRef, Renderer2, OnInit } from '@angular/core';
import { MarkdownParserService } from '../utility/markdown-parser.service';

@Directive({
  selector: '[mdmMarkdown]'
})
export class MarkdownDirective implements OnInit {
  private markdownInternal: any;

  @Input() renderType: any;

  constructor(
    private markdownParser: MarkdownParserService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.renderMarkdown();
  }

  get markdown(): any {
    return this.markdownInternal;
  }

  @Input('markdown')
  set markdown(markdown: any) {
    if (this.markdownInternal === markdown) { return; }

    this.markdownInternal = markdown;
    this.renderMarkdown();
  }

  private renderMarkdown() {
    if (this.markdown) {
      let html = this.markdownParser.parse(this.markdown, this.renderType);
      if (this.renderType === 'text') {
        html = `<p>${html}</p>`;
      }
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', html);
    }
  }
}
