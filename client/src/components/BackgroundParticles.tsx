import { motion } from "framer-motion";

export const BackgroundParticles = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden" style={{ position: 'fixed', zIndex: -1 }}>
      <div className="absolute inset-0 bg-dark-950"></div>
    </div>
  );
};