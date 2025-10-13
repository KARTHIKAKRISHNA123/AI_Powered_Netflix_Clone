import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAIRecommendation } from "../lib/AIModel";
import RecommendedMovies from "../components/RecommendedMovies";

const steps = [
  {
    name: "genre",
    label: "What's your favorite genre?",
    options: [
      "Action",
      "Comedy",
      "Drama",
      "Horror",
      "Romance",
      "Sci-Fi",
      "Animation",
    ],
  },
  {
    name: "mood",
    label: "What's your current mood?",
    options: [
      "Excited",
      "Relaxed",
      "Thoughtful",
      "Scared",
      "Inspired",
      "Romantic",
    ],
  },
  {
    name: "decade",
    label: "Preferred decade?",
    options: ["2020s", "2010s", "2000s", "1990s", "Older"],
  },
  {
    name: "language",
    label: "Preferred language?",
    options: ["English", "French", "Korean", "Spanish", "Other"],
  },
  {
    name: "length",
    label: "Preferred movie length?",
    options: ["Short (<90 min)", "Standard (90-120 min)", "Long (>120 min)"],
  },
];

const initialState = steps.reduce((acc, step) => {
  acc[step.name] = "";
  return acc;
}, {});

const AIRecommendations = () => {
  const [inputs, setInputs] = useState(initialState);
  const [step, setStep] = useState(0);
  const [recommendation, setRecommendation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentStepName = steps[step].name;

  const handleOption = (value) => {
    setInputs({ ...inputs, [currentStepName]: value });
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await generateRecommendation();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const generateRecommendation = async () => {
    if (Object.values(inputs).some((value) => value === "")) {
      return toast.error("Please complete all the steps first.");
    }
    setIsLoading(true);
    toast.loading("Generating your recommendations...");
    const userPrompt = `Given the following user inputs:

- Decade: ${inputs.decade}
- Genre: ${inputs.genre}
- Language: ${inputs.language}
- Length: ${inputs.length}
- Mood: ${inputs.mood}

Recommend 10 ${inputs.mood.toLowerCase()} ${
      inputs.language
    }-language ${inputs.genre.toLowerCase()} movies released in the ${
      inputs.decade
    } with a runtime between ${
      inputs.length
    }. Return the list as plain JSON array of movie titles only, No extra text, no explanations, no code blocks, no markdown, just the JSON array.
    example:
[
  "Movie Title 1",
  "Movie Title 2",
  "Movie Title 3",
  "Movie Title 4",
  "Movie Title 5",
  "Movie Title 6",
  "Movie Title 7",
  "Movie Title 8",
  "Movie Title 9",
  "Movie Title 10"
]`; // Kept concise for brevity
    try {
      const result = await getAIRecommendation(userPrompt);
      if (result) {
        const cleanedResult = result.replace(/```json\n?/g, "").replace(/\n?```/g, "");
        const recommendationArray = JSON.parse(cleanedResult);
        if (recommendationArray.length === 0) {
          toast.dismiss();
          toast.error("The AI couldn't find any matches. Please try different options.");
        } else {
          setRecommendation(recommendationArray);
          toast.dismiss();
          toast.success("Here are your recommendations!");
        }
      } else {
        throw new Error("Received an empty result from the AI.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate recommendations. Please try again.");
      console.error("Error in generateRecommendation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 md:px-8 py-5"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/background_banner.jpg')",
      }}
    >
      {recommendation.length > 0 ? (
        <div className="w-full max-w-7xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">AI Recommended Movies</h2>
            <button
              onClick={() => {
                setRecommendation([]);
                setInputs(initialState);
                setStep(0);
              }}
              className="px-6 py-2 rounded-lg font-semibold transition-colors duration-200 border-2 border-transparent text-gray-400 hover:text-white hover:bg-white/10"
            >
              Start Over
            </button>
          </div>
          <RecommendedMovies movieTitles={recommendation} />
        </div>
      ) : (
        <div className="relative w-full max-w-md mx-auto rounded-2xl bg-black/80 shadow-2xl border border-white/10 px-8 py-10 flex flex-col items-center min-h-[520px]">
          <h2 className="text-3xl font-bold mb-8 text-center text-white tracking-tight">
            AI Movie Recommendation
          </h2>
          <div className="w-full flex items-center mb-8">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full">
              <div
                className="h-full bg-[#e50914] rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            <span className="ml-4 text-gray-300 text-sm font-medium tabular-nums">{step + 1} / {steps.length}</span>
          </div>
          <div className="w-full flex flex-col flex-1">
            <div className="mb-6 flex-1">
              <h3 className="text-xl font-medium text-white mb-6 text-center">
                {steps[step].label}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {steps[step].options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOption(option)}
                    className={`w-full py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-x-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#e50914] ${
                      inputs[currentStepName] === option
                        ? "bg-[#e50914]/25 backdrop-blur-sm border-[#e50914] text-white font-bold hover:bg-[#e50914]/40"
                        : "bg-white/5 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/10 hover:border-[#e50914]"
                    }`}
                  >
                    {inputs[currentStepName] === option && <Check className="w-5 h-5 flex-shrink-0" />}
                    <span>{option}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center mt-auto pt-6 w-full">
              <button
                onClick={handleBack}
                type="button"
                className="flex items-center gap-x-2 px-6 py-2 rounded-lg font-semibold transition-colors duration-200 border-2 border-transparent text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-40"
                disabled={step === 0}
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-x-2 px-8 py-2.5 rounded-lg font-bold transition-all duration-200 border-2 border-transparent text-white bg-[#e50914] hover:bg-[#b0060f] disabled:opacity-40 disabled:cursor-not-allowed"
                type="button"
                disabled={!inputs[currentStepName] || isLoading}
              >
                <span>{isLoading ? "Generating..." : (step === steps.length - 1 ? "Get Movies" : "Next")}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;