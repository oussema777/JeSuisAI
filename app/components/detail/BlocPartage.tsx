'use client';
import React from 'react';
import { Share2, MessageCircle, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export function BlocPartage() {
  const handleShare = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = "Découvrez cette mission sur JeSuis Au Cameroun !";
    
    switch (platform) {
      case 'WhatsApp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'Facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'LinkedIn':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'X':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'Copier le lien':
        navigator.clipboard.writeText(url);
        toast.success('Lien copié dans le presse-papier !');
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: 'JeSuis Au Cameroun',
            text: text,
            url: url,
          }).catch(console.error);
        }
    }
  };
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 500 }}>
        Partager:
      </span>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleShare('WhatsApp')}
          className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-primary/10 flex items-center justify-center transition-colors group"
          aria-label="Partager sur WhatsApp"
        >
          <MessageCircle className="w-4 h-4 text-neutral-600 group-hover:text-primary" strokeWidth={2} />
        </button>
        
        <button
          onClick={() => handleShare('Facebook')}
          className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-primary/10 flex items-center justify-center transition-colors group"
          aria-label="Partager sur Facebook"
        >
          <Facebook className="w-4 h-4 text-neutral-600 group-hover:text-primary" strokeWidth={2} />
        </button>
        
        <button
          onClick={() => handleShare('X')}
          className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-primary/10 flex items-center justify-center transition-colors group"
          aria-label="Partager sur X"
        >
          <Share2 className="w-4 h-4 text-neutral-600 group-hover:text-primary" strokeWidth={2} />
        </button>
        
        <button
          onClick={() => handleShare('LinkedIn')}
          className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-primary/10 flex items-center justify-center transition-colors group"
          aria-label="Partager sur LinkedIn"
        >
          <Linkedin className="w-4 h-4 text-neutral-600 group-hover:text-primary" strokeWidth={2} />
        </button>
        
        <button
          onClick={() => handleShare('Copier le lien')}
          className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-primary/10 flex items-center justify-center transition-colors group"
          aria-label="Copier le lien"
        >
          <LinkIcon className="w-4 h-4 text-neutral-600 group-hover:text-primary" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
