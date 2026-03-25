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
        // Try to find the JSON meta in either a comment or a data-attribute
        const commentMatch = value.match(/<!--\s*ELEMENTOR_BLOCKS:\s*([A-Za-z0-9+/=]+)\s*-->/i);
        const attrMatch = value.match(/data-elementor-blocks="([A-Za-z0-9+/=]+)"/);
        
        const jsonMeta = commentMatch ? commentMatch[1] : (attrMatch ? attrMatch[1] : null);

        if (jsonMeta) {
            try {
                const jsonStr = decodeURIComponent(escape(atob(jsonMeta)));
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
        // Fallback: If it's HTML but no meta found, check if it contains elementor classes
        // to avoid double-wrapping if it's already a fallback block
        if (value.includes('elementor-content-wrapper')) {
           // It's likely elementor content but meta was lost. 
           // We'll treat it as one text block to prevent further mangling.
        }

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
        editing: true,
        backgroundImage: '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        columns: cols.map(w => ({ 
            width: w, 
            blocks: [],
            backgroundImage: '',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }))
      }
    };
    this.closeAllEditors();
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
        backgroundImage: '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        columns: [
          { 
            width: '50%', 
            blocks: [], 
            backgroundImage: '',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          },
          { 
            width: '50%', 
            blocks: [],
            backgroundImage: '',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }
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
        // Wrap the HTML in a container with the blocks data as an attribute
        html = `<div class="elementor-content-wrapper" data-elementor-blocks="${jsonMeta}">\n${html}\n<!-- ELEMENTOR_BLOCKS:${jsonMeta} -->\n</div>`;
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
    const baseStyle = 'margin-bottom: 20px; box-sizing: border-box;';
    
    // Helper to ensure numeric values have units (defaults to px)
    const ensureUnit = (val: any, unit = 'px') => {
      if (!val) return '0' + unit;
      if (/^[0-9.]+$/.test(String(val))) return val + unit;
      return val;
    };

    const getBackgroundStyle = (data: any) => {
      if (!data.backgroundImage) return '';
      return `background-image: url('${data.backgroundImage}'); background-size: ${data.backgroundSize || 'cover'}; background-position: ${data.backgroundPosition || 'center'}; background-repeat: ${data.backgroundRepeat || 'no-repeat'};`;
    };

    switch (block.type) {
      case 'text':
        return `<div class="elementor-block-text" style="${baseStyle} line-height: 1.6;">${block.data.content}</div>`;
      
      case 'image':
        return `<div class="elementor-block-image" style="${baseStyle} text-align: center;">
                  <img src="${block.data.url}" alt="${block.data.caption}" style="max-width: ${ensureUnit(block.data.width, '%')}; height: auto; border-radius: 4px; display: inline-block;">
                  ${block.data.caption ? `<p class="caption" style="font-size: 0.9em; color: #666; margin-top: 5px;">${block.data.caption}</p>` : ''}
                </div>`;
      
      case 'video':
        const videoId = block.data.url.includes('vimeo.com') ? this.extractVimeoId(block.data.url) : this.extractYoutubeId(block.data.url);
        let videoEmbed = '';
        if (block.data.url.includes('vimeo.com')) {
            videoEmbed = `<iframe src="https://player.vimeo.com/video/${videoId}" width="100%" height="315" frameborder="0" allow="autoplay; fullscreen" allowfullscreen style="border-radius: 4px;"></iframe>`;
        } else {
            videoEmbed = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius: 4px;"></iframe>`;
        }
        return `<div class="elementor-block-video" style="${baseStyle} position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">${videoEmbed}</div>
                </div>`;
      
      case 'button':
        return `<div class="elementor-block-button" style="${baseStyle} text-align: ${block.data.align};">
                  <a href="${block.data.link}" style="background-color: ${block.data.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 600; transition: opacity 0.2s;">${block.data.text}</a>
                </div>`;
      
      case 'spacer':
        return `<div class="elementor-block-spacer" style="height: ${ensureUnit(block.data.height)}; width: 100%;"></div>`;
      
      case 'divider':
        return `<div class="elementor-block-divider" style="${baseStyle} border-top: ${ensureUnit(block.data.thickness)} solid ${block.data.color}; width: 100%; margin: ${block.data.margin};"></div>`;
      
      case 'row':
        const rowBgStyle = getBackgroundStyle(block.data);
        const colsHtml = block.data.columns.map((col: any) => {
            const colBgStyle = getBackgroundStyle(col);
            return `<div class="elementor-column" style="width: ${ensureUnit(col.width, '%')}; flex: 0 0 ${ensureUnit(col.width, '%')}; padding: 20px 10px; box-sizing: border-box; ${colBgStyle}">
                        ${this.blocksToHtml(col.blocks)}
                    </div>`;
        }).join('');
        return `<div class="elementor-row" style="display: flex; flex-wrap: wrap; margin-left: -10px; margin-right: -10px; margin-bottom: 20px; ${rowBgStyle}">${colsHtml}</div>`;
      
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

  async onBackgroundImageUpload(target: any, event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        alert('Unsupported file type.');
        return;
    }

    if (this.uploadFn) {
        try {
            target.loading = true;
            this.cd.detectChanges();
            
            const url = await this.uploadFn(file);
            target.backgroundImage = url;
            target.loading = false;
            this.updateValue();
            this.cd.detectChanges();
        } catch (e: any) {
            target.loading = false;
            this.cd.detectChanges();
            alert(e.message || 'Upload failed.');
        }
    }
  }

  removeBackgroundImage(target: any) {
    target.backgroundImage = '';
    this.updateValue();
    this.cd.detectChanges();
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
    block.data.columns.push({ 
        width: '50%', 
        blocks: [],
        backgroundImage: '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    });
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
