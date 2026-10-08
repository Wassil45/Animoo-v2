import React, { useState } from 'react';
import { Pet, Species, User } from '../types';
import { AnimooLogo } from './AnimooLogo';
import { PET_IMAGES, USER_AVATARS } from '../data/petImages';
import { uploadPhoto } from '../services/storage';
import {
  Upload,
  Camera,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Heart,
  Sliders,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { Button, Input, Badge } from './ui';

interface OnboardingScreenProps {
  onComplete: (data: {
    pet: Pet;
    user: { email: string; name: string; avatar: string; password?: string };
  }) => Promise<void>;
  onSkipToLogin?: () => void;
}

type OnboardingStep = 'animal' | 'photo' | 'personality' | 'preferences' | 'zone';

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onSkipToLogin,
}) => {
  const [step, setStep] = useState<OnboardingStep>('animal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Step 1: Animal
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<Species>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('2');
  const [gender, setGender] = useState<'Mâle' | 'Femelle'>('Mâle');
  const [sterilized, setSterilized] = useState(true);

  // Step 2: Photo
  const [photoUrl, setPhotoUrl] = useState<string>(PET_IMAGES.milo[0]);

  // Step 3: Personnalité
  const [energyLevel, setEnergyLevel] = useState<'calm' | 'medium' | 'high'>('high');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '🎾 Fan de balle',
    '🐕 Très sociable',
  ]);
  const [bio, setBio] = useState('');

  // Step 4: Préférences
  const [prefSpecies, setPrefSpecies] = useState<'all' | 'dog' | 'cat'>('dog');
  const [maxDistanceKm, setMaxDistanceKm] = useState(10);
  const [prefMaxAge, setPrefMaxAge] = useState(8);

  // Step 5: Zone & Compte
  const [locationName, setLocationName] = useState('Paris 14e');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // File upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const uploaded = await uploadPhoto(file);
      setPhotoUrl(uploaded);
    } catch (err) {
      console.warn('Upload error:', err);
    } finally {
      setUploadLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newPet: Pet = {
        id: 'user_pet_' + Date.now(),
        name: petName.trim() || 'Mon Compagnon',
        age: parseFloat(age) || 2,
        species,
        breed: breed.trim() || (species === 'dog' ? 'Berger d’amour' : 'Chat joueur'),
        distanceKm: 0,
        locationName: locationName.trim() || 'Paris 14e',
        gender,
        sterilized,
        matchScore: 99,
        temperamentTitle:
          energyLevel === 'high'
            ? 'Plein d’énergie & Joueur'
            : energyLevel === 'calm'
            ? 'Calme & Câlin'
            : 'Équilibré & Sociable',
        temperamentDetail: 'Prêt pour faire de superbes rencontres et balades dans le quartier.',
        photos: [photoUrl],
        tags: selectedTags.length > 0 ? selectedTags : ['🎾 Joueur', '🐾 Très affectueux'],
        bio: bio.trim() || 'Superbe boule de poils qui cherche de nouveaux copains de jeu !',
        verified: true,
        vaccinesUpToDate: true,
        chipped: true,
        ownerName: ownerName.trim() || 'Maître Animoo',
        ownerAge: 28,
        ownerAvatar: USER_AVATARS.wassil,
        ownerBio: 'Passionné par le bien-être animal et les balades partagées.',
        favoriteParks: ['Parc du quartier', 'Bois de Vincennes'],
      };

      await onComplete({
        pet: newPet,
        user: {
          email: email.trim() || `user_${Date.now()}@animoo.fr`,
          name: ownerName.trim() || 'Maître Animoo',
          avatar: USER_AVATARS.wassil,
          password: password.trim() || undefined,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTags = [
    '🎾 Fan de balle',
    '🐕 Très sociable',
    '🌊 Adore nager',
    '🥏 Pro du frisbee',
    '🛋️ Champion de sieste',
    '🌳 Balades en forêt',
    '🐈 Joueur avec plumeau',
    '🧀 Gourmand',
  ];

  const stepsList: OnboardingStep[] = ['animal', 'photo', 'personality', 'preferences', 'zone'];
  const currentStepIdx = stepsList.indexOf(step);

  return (
    <div className="w-full min-h-screen bg-[#FCF9F8] text-[#1B1C1C] flex flex-col justify-between px-5 pt-3 pb-8 select-none">
      {/* Header with Logo & Step Indicators */}
      <header className="flex flex-col items-center justify-center pt-2 pb-3 text-center">
        <AnimooLogo size="sm" showTagline={false} />
        {/* Step Indicator Bar */}
        <div className="flex items-center gap-1.5 mt-3 w-full max-w-xs">
          {stepsList.map((s, idx) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx <= currentStepIdx ? 'bg-primary' : 'bg-stone-200'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-bold text-stone-500 mt-1 uppercase tracking-wider">
          Étape {currentStepIdx + 1}/5 : {
            step === 'animal'
              ? 'Votre Animal'
              : step === 'photo'
              ? 'Sa Photo'
              : step === 'personality'
              ? 'Sa Personnalité'
              : step === 'preferences'
              ? 'Vos Préférences'
              : 'Votre Zone'
          }
        </span>
      </header>

      {/* Main Form Body */}
      <main className="flex-1 flex flex-col justify-center my-3 max-w-md mx-auto w-full">
        {/* ÉTAPE 1 : ANIMAL */}
        {step === 'animal' && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <div className="text-center mb-1">
              <h1 className="text-xl font-black text-stone-900">Qui est votre boule de poils ? 🐾</h1>
              <p className="text-xs text-stone-500 mt-0.5">Commençons par faire les présentations.</p>
            </div>

            {/* Espèce */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSpecies('dog')}
                className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  species === 'dog'
                    ? 'bg-rose-50 border-primary text-primary shadow-sm'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className="text-xl">🐶</span>
                <span>C'est un Chien</span>
              </button>
              <button
                type="button"
                onClick={() => setSpecies('cat')}
                className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  species === 'cat'
                    ? 'bg-rose-50 border-primary text-primary shadow-sm'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className="text-xl">🐱</span>
                <span>C'est un Chat</span>
              </button>
            </div>

            {/* Nom */}
            <Input
              label="Son prénom *"
              placeholder="Ex: Milo, Nala, Rocky..."
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              required
            />

            {/* Race */}
            <Input
              label="Sa race"
              placeholder={species === 'dog' ? 'Ex: Berger Australien, Golden...' : 'Ex: Bengal, Européen...'}
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
            />

            {/* Âge & Sexe */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Âge (années)"
                type="number"
                min="0.5"
                max="20"
                step="0.5"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-stone-700">Sexe</label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setGender('Mâle')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      gender === 'Mâle' ? 'bg-primary text-white border-primary' : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    Mâle
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('Femelle')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      gender === 'Femelle' ? 'bg-primary text-white border-primary' : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    Femelle
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                if (!petName.trim()) setPetName('Milo');
                setStep('photo');
              }}
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continuer vers la photo
            </Button>
          </div>
        )}

        {/* ÉTAPE 2 : PHOTO */}
        {step === 'photo' && (
          <div className="flex flex-col gap-4 animate-fadeIn text-center">
            <div>
              <h1 className="text-xl font-black text-stone-900">La plus belle photo de {petName || 'votre animal'} 📸</h1>
              <p className="text-xs text-stone-500 mt-0.5">Une belle photo augmente les matchs de 80% !</p>
            </div>

            {/* Photo Preview Container */}
            <div className="relative w-44 h-52 mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-stone-100 flex items-center justify-center group">
              <img
                src={photoUrl}
                alt="Aperçu animal"
                width={176}
                height={208}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              {uploadLoading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                  Téléversement...
                </div>
              )}
            </div>

            {/* Upload File Button */}
            <div className="flex flex-col gap-2 max-w-xs mx-auto w-full">
              <label className="w-full py-3 px-4 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-stone-800 transition-colors shadow-md">
                <Upload className="w-4 h-4" />
                <span>Téléverser depuis la galerie</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Quick Preset Avatars Picker */}
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-[11px] font-bold text-stone-400">Ou choisir :</span>
                {(species === 'dog'
                  ? [PET_IMAGES.milo[0], PET_IMAGES.nala[0], PET_IMAGES.rocky[0], PET_IMAGES.lunaDog[0]]
                  : [PET_IMAGES.simbaCat[0], PET_IMAGES.lunaCat[0]]
                ).map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoUrl(img)}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-stone-200 hover:border-primary transition-all active:scale-95"
                  >
                    <img src={img} alt="Avatar" width={40} height={40} loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Button onClick={() => setStep('animal')} variant="secondary" size="md">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setStep('personality')}
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Suivant : Personnalité
              </Button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : PERSONNALITÉ */}
        {step === 'personality' && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <div className="text-center mb-1">
              <h1 className="text-xl font-black text-stone-900">Son tempérament & ses passions ⚡</h1>
              <p className="text-xs text-stone-500 mt-0.5">Pour trouver des compagnons de jeu compatibles.</p>
            </div>

            {/* Niveau d'énergie */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">Niveau d'énergie</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'calm', label: 'Calme 💤' },
                  { id: 'medium', label: 'Équilibré 🎾' },
                  { id: 'high', label: 'Débordant ⚡' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setEnergyLevel(lvl.id as any)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      energyLevel === lvl.id
                        ? 'bg-rose-50 border-primary text-primary'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags de centres d'intérêt */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">Centres d'intérêt</label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSel = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                        isSel ? 'bg-primary text-white border-primary' : 'bg-white border-stone-200 text-stone-700'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Petite bio */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Présentation rapide</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ex: Adore courir au parc, sociable avec les autres chiens, très affectueux..."
                rows={2}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Button onClick={() => setStep('photo')} variant="secondary" size="md">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setStep('preferences')}
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Suivant : Préférences
              </Button>
            </div>
          </div>
        )}

        {/* ÉTAPE 4 : PRÉFÉRENCES */}
        {step === 'preferences' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="text-center mb-1">
              <h1 className="text-xl font-black text-stone-900">Que recherchez-vous pour {petName || 'lui'} ? 🔍</h1>
              <p className="text-xs text-stone-500 mt-0.5">Configurez vos critères de rencontre et balades.</p>
            </div>

            {/* Espèce recherchée */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">Je souhaite rencontrer des :</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: '🐾 Tous' },
                  { id: 'dog', label: '🐶 Chiens' },
                  { id: 'cat', label: '🐱 Chats' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPrefSpecies(opt.id as any)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      prefSpecies === opt.id
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance maximale */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700">Distance maximale</label>
                <span className="text-xs font-bold text-primary">{maxDistanceKm} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                <span>1 km (Voisinage)</span>
                <span>10 km</span>
                <span>25 km</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Button onClick={() => setStep('personality')} variant="secondary" size="md">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setStep('zone')}
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Suivant : Zone & Inscription
              </Button>
            </div>
          </div>
        )}

        {/* ÉTAPE 5 : ZONE & COMPTE */}
        {step === 'zone' && (
          <form onSubmit={handleFinish} className="flex flex-col gap-3 animate-fadeIn">
            <div className="text-center mb-1">
              <h1 className="text-xl font-black text-stone-900">Votre quartier & votre compte 📍</h1>
              <p className="text-xs text-stone-500 mt-0.5">Finalisez pour commencer à swiper et matcher !</p>
            </div>

            <Input
              label="Votre ville ou quartier *"
              placeholder="Ex: Paris 14e, Lyon 6e..."
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
            />

            <Input
              label="Votre prénom (le maître) *"
              placeholder="Ex: Wassil, Sophie, Thomas..."
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />

            <Input
              label="Votre adresse email *"
              type="email"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Mot de passe *"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center gap-2 mt-2">
              <Button type="button" onClick={() => setStep('preferences')} variant="secondary" size="md">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Créer mon compte & Démarrer 🐾
              </Button>
            </div>
          </form>
        )}
      </main>

      {/* Footer link to sign in if user already has an account */}
      <footer className="text-center pt-2">
        {onSkipToLogin && (
          <p className="text-xs text-stone-500">
            Vous avez déjà un compte ?{' '}
            <button
              type="button"
              onClick={onSkipToLogin}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Se connecter
            </button>
          </p>
        )}
      </footer>
    </div>
  );
};
