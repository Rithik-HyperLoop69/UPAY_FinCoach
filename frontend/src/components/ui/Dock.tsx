import React, { useRef, useState } from 'react';
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'motion/react';
import './Dock.css';

export interface DockItemData {
  icon?: React.ReactNode;
  label: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  href?: string;
}

export interface DockProps {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
  spring?: { mass?: number; stiffness?: number; damping?: number };
}

interface DockItemProps {
  item: DockItemData;
  mouseX: MotionValue<number>;
  spring: { mass?: number; stiffness?: number; damping?: number };
  distance: number;
  magnification: number;
}

function DockItem({
  item,
  mouseX,
  spring,
  distance,
  magnification,
}: DockItemProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Proximity to pointer horizontally
  const mouseDistance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return Infinity;
    return val - (rect.left + rect.width / 2);
  });

  // Scale smoothly between 1.0 (rest) and magnification (e.g. 1.22)
  const targetScale = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [1, magnification, 1]
  );
  const scale = useSpring(targetScale, spring);

  // Lift slightly on proximity (-4px)
  const targetY = useTransform(mouseDistance, [-distance, 0, distance], [0, -4, 0]);
  const y = useSpring(targetY, spring);

  return (
    <motion.a
      ref={ref}
      href={item.href || '#'}
      style={{
        scale,
        y,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={item.onClick}
      className={`dock-item ${item.className || ''}`}
    >
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="dock-tooltip"
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>

      {item.icon && <span className="dock-item-icon">{item.icon}</span>}
      <span className="dock-item-label">{item.label}</span>
    </motion.a>
  );
}

export const Dock: React.FC<DockProps> = ({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 170, damping: 14 },
  magnification = 1.22,
  distance = 130,
}) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.nav
      className={`dock-container ${className}`}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      <div className="dock-panel">
        {items.map((item, index) => (
          <DockItem
            key={index}
            item={item}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
          />
        ))}
      </div>
    </motion.nav>
  );
};

export default Dock;
