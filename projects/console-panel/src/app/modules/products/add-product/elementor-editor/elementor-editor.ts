import { ChangeDetectorRef, Component, EventEmitter, forwardRef, inject, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CustomEditorComponent } from 'custom-editor';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

export interface ElementorBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'button' | 'spacer' | 'divider' | 'row';
  data: any;
}

@Component({
  selector: 'app-elementor-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomEditorComponent, DragDropModule],
  templateUrl: './elementor-editor.html',
  styleUrl: './elementor-editor.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ElementorEditor),
      multi: true,
    },
  ],
})
export class ElementorEditor implements ControlValueAccessor, OnChanges {
  @Input() uploadFn?: (file: File) => Promise<string> | string;
  @Output() valueChange = new EventEmitter<string>();

  blocks: ElementorBlock[] = [];
  disabled = false;
  showStructureChoice = true;
  
  activeBlocksArray: ElementorBlock[] = [];

  widgetTypes: ElementorBlock['type'][] = ['text', 'image', 'video', 'button', 'spacer', 'divider'];

  layoutPresets = [
    { name: '1 Column', icon: 'fa-square', cols: ['100%'] },
    { name: '2 Columns', icon: 'fa-pause', cols: ['50%', '50%'] },
    { name: '3 Columns', icon: 'fa-align-justify fa-rotate-90', cols: ['33.33%', '33.33%', '33.33%'] },
    { name: '4 Columns', icon: 'fa-grip-lines-vertical', cols: ['25%', '25%', '25%', '25%'] },
    { name: 'Left Heavy', icon: 'fa-columns', cols: ['66.66%', '33.33%'] },
    { name: 'Right Heavy', icon: 'fa-columns fa-flip-horizontal', cols: ['33.33%', '66.66%'] }
  ];

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private cd = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    this.activeBlocksArray = this.blocks;
  }

  getWidgetIcon(type: ElementorBlock['type']): string {
    switch (type) {
      case 'text': return 'fa fa-font';
      case 'image': return 'fa fa-image';
      case 'video': return 'fa fa-video';
      case 'button': return 'fa fa-rectangle-list';
      case 'spacer': return 'fa fa-arrows-up-down';
      case 'divider': return 'fa fa-minus';
      case 'row': return 'fa fa-columns';
      default: return 'fa fa-cube';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  writeValue(value: any): void {
    if (value && typeof value === 'string') {
        const match = value.match(/<!-- ELEMENTOR_BLOCKS:([A-Za-z0-9+/=]+) -->/);
        if (match && match[1]) {
            try {
                const jsonStr = decodeURIComponent(escape(atob(match[1])));
                this.blocks = JSON.parse(jsonStr);
                this.resetEditingState(this.blocks);
                this.showStructureChoice = this.blocks.length === 0;
                this.activeBlocksArray = this.blocks;
                this.cd.detectChanges();
                return;
            } catch (e) {
                console.error('Failed to parse Elementor blocks', e);
            }
        }
    }
    
    if (value && typeof value === 'string' && value.trim()) {
        this.blocks = [{
            id: this.generateId(),
            type: 'text',
            data: { content: value, editing: false }
        }];
        this.showStructureChoice = false;
    } else {
        this.blocks = [];
        this.showStructureChoice = true;
    }
    this.activeBlocksArray = this.blocks;
    this.cd.detectChanges();
  }

  private resetEditingState(blocks: ElementorBlock[]) {
    blocks.forEach(b => {
      b.data.editing = false;
      b.data.loading = false;
      if (b.type === 'row' && b.data.columns) {
        b.data.columns.forEach((col: any) => this.resetEditingState(col.blocks));
      }
    });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cd.detectChanges();
  }

  addSection(cols: string[]) {
    const newBlock: ElementorBlock = {
      id: this.generateId(),
      type: 'row',
      data: {
        editing: false,
        columns: cols.map(w => ({ width: w, blocks: [] }))
      }
    };
    this.blocks.push(newBlock);
    this.showStructureChoice = false;
    this.activeBlocksArray = newBlock.data.columns[0].blocks;
    this.updateValue();
    this.cd.detectChanges();
  }

  selectTarget(targetArray: ElementorBlock[], event?: Event) {
    if (event) {
        event.stopPropagation();
    }
    this.activeBlocksArray = targetArray;
    this.cd.detectChanges();
  }

  addBlock(type: ElementorBlock['type']) {
    const newBlock: ElementorBlock = {
      id: this.generateId(),
      type,
      data: this.getDefaultData(type)
    };
    this.closeAllEditors();
    this.activeBlocksArray.push(newBlock);
    this.updateValue();
    this.cd.detectChanges();
  }

  private closeAllEditors(blocks: ElementorBlock[] = this.blocks) {
    blocks.forEach(b => {
      b.data.editing = false;
      if (b.type === 'row' && b.data.columns) {
        b.data.columns.forEach((col: any) => this.closeAllEditors(col.blocks));
      }
    });
  }

  removeBlock(index: number, targetArray: ElementorBlock[] = this.blocks) {
    if (confirm('Are you sure you want to remove this?')) {
      targetArray.splice(index, 1);
      if (this.blocks.length === 0) {
        this.showStructureChoice = true;
        this.activeBlocksArray = this.blocks;
      }
      this.updateValue();
      this.cd.detectChanges();
    }
  }

  duplicateBlock(index: number, targetArray: ElementorBlock[] = this.blocks) {
    const block = JSON.parse(JSON.stringify(targetArray[index]));
    this.regenerateIdsRecursive(block);
    block.data.editing = true;
    targetArray.splice(index + 1, 0, block);
    this.updateValue();
    this.cd.detectChanges();
  }

  private regenerateIdsRecursive(block: ElementorBlock) {
    block.id = this.generateId();
    if (block.type === 'row' && block.data.columns) {
      block.data.columns.forEach((col: any) => {
        col.blocks.forEach((b: any) => this.regenerateIdsRecursive(b));
      });
    }
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      if (event.previousContainer.id === 'widgetList') {
        const type = event.item.data as ElementorBlock['type'];
        const newBlock: ElementorBlock = {
          id: this.generateId(),
          type,
          data: this.getDefaultData(type)
        };
        
        // Selection Redirection: If a specific column is active, add there instead of root canvas
        let targetArray = event.container.data;
        if (event.container.id === 'canvasList' && this.activeBlocksArray !== this.blocks) {
            targetArray = this.activeBlocksArray;
        }
        
        this.closeAllEditors();
        targetArray.push(newBlock);
        this.activeBlocksArray = targetArray;
      } else {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.activeBlocksArray = event.container.data;
      }
    }
    this.updateValue();
    this.cd.detectChanges();
  }

  updateValue() {
    const html = this.blocksToHtml();
    this.onChange(html);
    this.valueChange.emit(html);
  }

  private generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  private getDefaultData(type: ElementorBlock['type']): any {
    switch (type) {
      case 'text': return { content: '', editing: true };
      case 'image': return { url: '', caption: '', width: '100%', loading: false, editing: true };
      case 'video': return { url: '', provider: 'youtube', editing: true };
      case 'button': return { text: 'Click Here', link: '', align: 'left', color: '#007bff', editing: true };
      case 'spacer': return { height: '50px', editing: true };
      case 'divider': return { thickness: '1px', color: '#eeeeee', margin: '20px 0', editing: true };
      case 'row': return { 
        editing: false,
        columns: [
          { width: '50%', blocks: [] },
          { width: '50%', blocks: [] }
        ]
      };
      default: return { editing: true };
    }
  }

  private blocksToHtml(blocks: ElementorBlock[] = this.blocks): string {
    if (blocks.length === 0) return '';

    let html = blocks.map(block => this.renderBlock(block)).join('\n');
    
    if (blocks === this.blocks) {
        const cleanBlocks = this.getCleanBlocks(this.blocks);
        const jsonMeta = btoa(unescape(encodeURIComponent(JSON.stringify(cleanBlocks))));
        html += `\n<!-- ELEMENTOR_BLOCKS:${jsonMeta} -->`;
    }
    
    return html;
  }

  private getCleanBlocks(blocks: ElementorBlock[]): any[] {
    return blocks.map(b => {
        const { editing, loading, ...data } = b.data;
        const cleanData = { ...data };
        if (b.type === 'row' && cleanData.columns) {
            cleanData.columns = cleanData.columns.map((col: any) => ({
                ...col,
                blocks: this.getCleanBlocks(col.blocks)
            }));
        }
        return { ...b, data: cleanData };
    });
  }

  private renderBlock(block: ElementorBlock): string {
    switch (block.type) {
      case 'text':
        return `<div class="elementor-block-text">${block.data.content}</div>`;
      case 'image':
        return `<div class="elementor-block-image" style="text-align: center;">
                  <img src="${block.data.url}" alt="${block.data.caption}" style="max-width: ${block.data.width}; height: auto;">
                  ${block.data.caption ? `<p class="caption">${block.data.caption}</p>` : ''}
                </div>`;
      case 'video':
        const videoId = block.data.url.includes('vimeo.com') ? this.extractVimeoId(block.data.url) : this.extractYoutubeId(block.data.url);
        let videoEmbed = '';
        if (block.data.url.includes('vimeo.com')) {
            videoEmbed = `<iframe src="https://player.vimeo.com/video/${videoId}" width="100%" height="315" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
        } else {
            videoEmbed = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        }
        return `<div class="elementor-block-video">${videoEmbed}</div>`;
      case 'button':
        return `<div class="elementor-block-button" style="text-align: ${block.data.align}; margin: 10px 0;">
                  <a href="${block.data.link}" style="background-color: ${block.data.color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">${block.data.text}</a>
                </div>`;
      case 'spacer':
        return `<div class="elementor-block-spacer" style="height: ${block.data.height};"></div>`;
      case 'divider':
        return `<div class="elementor-block-divider" style="border-top: ${block.data.thickness} solid ${block.data.color}; margin: ${block.data.margin};"></div>`;
      case 'row':
        const colsHtml = block.data.columns.map((col: any) => {
            return `<div class="elementor-column" style="width: ${col.width}; flex: 0 0 ${col.width};">
                        ${this.blocksToHtml(col.blocks)}
                    </div>`;
        }).join('');
        return `<div class="elementor-row" style="display: flex; flex-wrap: wrap;">${colsHtml}</div>`;
      default:
        return '';
    }
  }

  getSafeVideoUrl(block: ElementorBlock): SafeHtml {
    const url = block.data.url;
    let embedUrl = '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        embedUrl = `https://www.youtube.com/embed/${this.extractYoutubeId(url)}`;
    } else if (url.includes('vimeo.com')) {
        embedUrl = `https://player.vimeo.com/video/${this.extractVimeoId(url)}`;
    }
    return this.sanitizer.bypassSecurityTrustHtml(`<iframe width="100%" height="200" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`);
  }

  private extractYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  private extractVimeoId(url: string) {
    const match = url.match(/vimeo.com\/(\d+)/);
    return match ? match[1] : '';
  }

  async onImageUpload(block: ElementorBlock, event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        alert('Unsupported file type.');
        return;
    }
    if (file.size > 1_000_000) {
        alert('File size too large.');
        return;
    }

    if (this.uploadFn) {
        try {
            block.data.loading = true;
            this.cd.detectChanges();
            
            const url = await this.uploadFn(file);
            block.data.url = url;
            block.data.loading = false;
            block.data.editing = false;
            this.updateValue();
            this.cd.detectChanges();
        } catch (e: any) {
            block.data.loading = false;
            this.cd.detectChanges();
            alert(e.message || 'Upload failed.');
        }
    }
  }

  toggleEdit(block: ElementorBlock, event?: Event) {
    if (event) {
        event.stopPropagation();
    }
    const currentState = block.data.editing;
    this.closeAllEditors();
    block.data.editing = !currentState;
    this.cd.detectChanges();
  }

  addRowColumn(block: ElementorBlock) {
    block.data.columns.push({ width: '50%', blocks: [] });
    this.recalculateColumnWidths(block);
    this.updateValue();
  }

  removeRowColumn(block: ElementorBlock, index: number) {
    if (block.data.columns.length > 1) {
        block.data.columns.splice(index, 1);
        this.recalculateColumnWidths(block);
        this.updateValue();
    }
  }

  private recalculateColumnWidths(block: ElementorBlock) {
    const count = block.data.columns.length;
    const width = (100 / count).toFixed(2) + '%';
    block.data.columns.forEach((col: any) => col.width = width);
  }
}
