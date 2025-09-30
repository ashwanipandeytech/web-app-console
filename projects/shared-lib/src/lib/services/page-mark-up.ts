import { Injectable } from '@angular/core';
import { BLOCKS, INLINES, } from '@contentful/rich-text-types';

@Injectable({
  providedIn: 'root'
})

export class PageMarkUp {
  embeddedImage = {
    renderNode: {
      // this is the important part 👇
      [INLINES.HYPERLINK]: (node:any, next:any) => { 
  
        let anchorLink = node.data.uri;
        if (anchorLink.indexOf("www") == 0 || anchorLink.indexOf("http://") == 0 || anchorLink.indexOf("https://") == 0) {
          if (anchorLink.indexOf("www") == 0) {
            anchorLink = "https://" + anchorLink;
          }
          let anchorContent = next(node.content);
          const boldReplace = new RegExp('<b>' + '', 'g');
          const italicReplace = new RegExp('<i>' + '', 'g');
          const underlineReplace = new RegExp('<u>' + '', 'g');
          anchorContent = anchorContent.replace(boldReplace, '<b class=externalLinkCful' + anchorLink + '>')
          anchorContent = anchorContent.replace(italicReplace, '<i class=externalLinkCful' + anchorLink + '>')
          anchorContent = anchorContent.replace(underlineReplace, '<u class=externalLinkCful' + anchorLink + '>')  
          return `<a class="externalLinkCful ${anchorLink}">${anchorContent}</a>`;
  
        } else {
          return `<a href="${node.data.uri}">${next(node.content)}</a>`; 
  
        }
  
      },
      [BLOCKS.EMBEDDED_ASSET]: (node:any, next:any) => {  
        return `<img class="img-fluid" src="${node.data.target.fields.file.url}"/>`
      }
  
  
    }
  
  
  }


  removeBlankTags(richText: string) {
    // var count = (richText.match(/<[^\\/>][^>]*><\/[^>]+>/g) || []).length;
    let text;
   
       if (richText && typeof richText === 'string') {
      text = richText.replace(/<[^\\/>][^>]*><\/[^>]+>/gi, '<br>');
      text = text.replace(/<[^\\/>][^>]*>[ \n\r\t]<\/[^>]+>/gi, '<br>');
      // text = text.replace(/href="/gi, 'href="' + global.urlSuffix + '/');
      // const suffix = global?.urlSuffix?.replace(/\/+$/, '') || '';
      // text = text.replace(/href="\/*/gi, `href="${suffix}/`);

      // Remove trailing empty <p> tag (optional whitespace inside)
      text = text.replace(/<p\s*>\s*<\/p>\s*$/i, '');

      // Remove trailing <br> tag(s)
      text = text.replace(/<br\s*\/?>\s*$/i, '');
      
    }
    
   
    return text;
  }
  
}

