import { motion } from "motion/react";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-2xl shadow-primary/50 z-40"
    >
      <Plus className="w-6 h-6 text-white" />
    </motion.button>
  );
}
