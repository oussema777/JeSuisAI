import Image from 'next/image';

interface Partenaire {
  nom: string;
  logo: string;
}

interface PartenairesSliderProps {
  logos?: Partenaire[];
}

export function PartenairesSlider({ logos }: PartenairesSliderProps) {
  // Use provided logos or fall back to defaults
  const currentLogos = (logos && logos.length > 0) ? logos : [
    { nom: 'Partenaire 1', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-1.png' },
    { nom: 'Partenaire 2', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-2.png' },
    { nom: 'Partenaire 3', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-3.png' },
    { nom: 'Partenaire 4', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-4.png' },
    { nom: 'Partenaire 5', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-5.png' },
  ];

  // Duplicate the list to create infinite loop effect
  const partenairesDoubled = [...currentLogos, ...currentLogos, ...currentLogos];

  return (
    <div className="w-full bg-neutral-50 py-12 overflow-hidden">
      <div className="relative">
        <div className="flex animate-scroll-partners gap-12">
          {partenairesDoubled.map((partenaire, index) => (
            <div
              key={`${partenaire.nom}-${index}`}
              className="flex-shrink-0 flex items-center justify-center"
            >
              {/* Logo Container without border or effects */}
              <div className="w-48 h-20 flex items-center justify-center p-4">
                <Image
                  src={partenaire.logo}
                  alt={partenaire.nom}
                  width={192} // TODO: Update with correct width
                  height={80} // TODO: Update with correct height
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}