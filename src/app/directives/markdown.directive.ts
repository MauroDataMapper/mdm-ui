import { Directive, Input, ElementRef, Renderer2, OnInit } from '@angular/core';
import { MarkdownParserService } from '../utility/markdown-parser.service';

@Directive({
  selector: '[appMarkdown]'
})
export class MarkdownDirective implements OnInit {
  private markdown_: any;

  @Input('render-type') renderType: any;

  constructor(
    private markdownParser: MarkdownParserService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.renderMarkdown();
  }

  get markdown(): any {
    return this.markdown_;
  }

  @Input('markdown')
  set markdown(markdown: any) {
    if (this.markdown_ === markdown) { return; }

    this.markdown_ = markdown;
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
