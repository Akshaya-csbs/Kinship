import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Music, Palette, Camera, Users } from "lucide-react";

const onboardingSteps = [
  {
    icon: Music,
    title: "Discover Passionate Creators",
    description: "Connect with singers, dancers, artists, chefs, and talented people from all creative fields",
    image: "https://images.unsplash.com/photo-1576967402682-19976eb930f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nZXIlMjBwZXJmb3JtaW5nJTIwY29uY2VydCUyMHN0YWdlfGVufDF8fHx8MTc4MDAzNTU3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    icon: Palette,
    title: "Share Your Artistic Journey",
    description: "Showcase your work, build your portfolio, and express your creative identity",
    image: "https://images.unsplash.com/photo-1613667013398-0ab87d27641b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwYWludGVyJTIwY3JlYXRpdmUlMjBzdHVkaW98ZW58MXx8fHwxNzgwMDM1NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    icon: Camera,
    title: "Find Meaningful Collaborations",
    description: "Partner with like-minded creators on projects that matter",
    image: "https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoZXIlMjBjYW1lcmElMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODAwMzU1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    icon: Users,
    title: "Join Your Creative Community",
    description: "Build lasting connections, grow together, and inspire one another",
    image: "https://images.unsplash.com/photo-1547153760-18fc86324498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkYW5jZXIlMjBtb2Rlcm58ZW58MXx8fHwxNzgwMDM1NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/auth");
    }
  };

  const handleSkip = () => {
    navigate("/auth");
  };

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background image with overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={step.image}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Skip button */}
        <div className="p-6 flex justify-end">
          <button
            onClick={handleSkip}
            className="text-white/70 hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-end p-8 pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mb-6"
              >
                <Icon className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                {step.title}
              </h2>

              <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-md">
                {step.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress indicators */}
          <div className="flex items-center gap-4 mb-8">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-primary/50 transition-all active:scale-95"
          >
            <span className="font-medium">
              {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Continue"}
            </span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
