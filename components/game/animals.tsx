import type { IconType } from "react-icons";
import {
  GiBoar,
  GiDeer,
  GiFoxHead,
  GiRabbitHead,
  GiWolfHead,
} from "react-icons/gi";
import type { AnimalId } from "./data";

type Props = {
  id: AnimalId;
  className?: string;
};

const ICONS: Record<AnimalId, IconType> = {
  geyik: GiDeer,
  tavsan: GiRabbitHead,
  cakal: GiWolfHead,
  tilki: GiFoxHead,
  domuz: GiBoar,
};

export function AnimalIcon({ id, className = "h-9 w-9" }: Props) {
  const Icon = ICONS[id];
  return (
    <Icon
      className={`shrink-0 text-[#e8e8e8] ${className}`}
      aria-hidden
    />
  );
}
