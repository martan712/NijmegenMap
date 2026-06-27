import type { FC } from "react";
import { localName, mediaUrl } from "../../../verhalen/api";
import type { Block } from "../../../verhalen/types";
import type { MemorialPoint } from "../../../types";
import { MemorialWall } from "./MemorialWall";
import styles from "../verhalen.module.css";

/**
 * Shared data a panel block may need beyond its own fields (the Stolpersteine
 * dataset + the "fly to a stone" callback for the memorial wall).
 */
export interface PanelContext {
  memorials: MemorialPoint[];
  onSelectVictim: (p: MemorialPoint) => void;
}

interface PanelProps {
  block: Block;
  ctx: PanelContext;
}

const Narrative: FC<PanelProps> = ({ block }) => (
  <p className={styles.narrative}>{block.text}</p>
);

const Quote: FC<PanelProps> = ({ block }) => (
  <blockquote className={styles.quote}>
    <p>{block.verbatim}</p>
    <cite>{[block.credit, block.locator].filter(Boolean).join(" · ")}</cite>
  </blockquote>
);

const Audio: FC<PanelProps> = ({ block }) => (
  <figure className={styles.audio}>
    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
    <audio controls preload="metadata" src={block.mediaPath ? mediaUrl(block.mediaPath) : undefined} />
    <figcaption>{block.credit}</figcaption>
  </figure>
);

const Document: FC<PanelProps> = ({ block }) => (
  <figure className={styles.document}>
    {block.mediaPath && <img src={mediaUrl(block.mediaPath)} alt={block.credit ?? ""} />}
    {block.verbatim && <p className={styles.transcript}>{block.verbatim}</p>}
    <figcaption>{[block.credit, block.locator].filter(Boolean).join(" · ")}</figcaption>
  </figure>
);

const Gallery: FC<PanelProps> = ({ block }) => (
  <figure className={styles.gallery}>
    {block.mediaPath && <img src={mediaUrl(block.mediaPath)} alt={block.credit ?? ""} />}
    <figcaption>{block.credit}</figcaption>
  </figure>
);

const Memorial: FC<PanelProps> = ({ ctx }) =>
  ctx.memorials.length > 0 ? (
    <MemorialWall points={ctx.memorials} onSelect={ctx.onSelectVictim} />
  ) : null;

const Fallback: FC<PanelProps> = ({ block }) => (
  <p className={styles.narrative}>{block.text ?? block.verbatim}</p>
);

/** rdf:type local name → the React component that renders that block. */
const REGISTRY: Record<string, FC<PanelProps>> = {
  NarrativeBlock: Narrative,
  QuoteBlock: Quote,
  AudioBlock: Audio,
  DocumentBlock: Document,
  GalleryBlock: Gallery,
  ImageBlock: Gallery,
  MemorialWallBlock: Memorial,
};

/** Renders one block by dispatching on its backend type (defaults to narrative). */
export function PanelBlock({ block, ctx }: PanelProps) {
  const Component = REGISTRY[localName(block.type)] ?? Fallback;
  return <Component block={block} ctx={ctx} />;
}
