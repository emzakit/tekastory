
import React from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Clapperboard, Undo2, Redo2, FolderOpen, Save, FileDown, Plus, X, PlusCircle,
  ImageIcon, GripVertical, Trash2, Film, UploadCloud, Award, Info, Lightbulb,
  LoaderCircle,
} from 'lucide-react';

const icons = {
  Clapperboard,
  Undo2,
  Redo2,
  FolderOpen,
  Save,
  FileDown,
  Plus,
  X,
  PlusCircle,
  ImageIcon,
  GripVertical,
  Trash2,
  Film,
  UploadCloud,
  Award,
  Info,
  Lightbulb,
  LoaderCircle,
};

export type IconName = keyof typeof icons;

const Icon: React.FC<{ name: IconName; className?: string } & Omit<LucideProps, 'name'>> = ({ name, className, ...props }) => {
  const LucideIcon = icons[name];
  if (!LucideIcon) {
    return null;
  }
  return <LucideIcon className={className || 'w-5 h-5'} {...props} />;
};

export default Icon;
