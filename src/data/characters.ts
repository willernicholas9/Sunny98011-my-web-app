import { CharacterConfig } from "../types/gameTypes";

export const CHARACTERS: CharacterConfig[] = [
  {
    id: "zack",
    name: "Zack",
    title: "The Lightning Runner",
    color: "#ef4444", // Red
    accentColor: "#fca5a5",
    avatarIcon: "⚡",
    jumpSounds: ["Woohoo!", "Up we go!", "Sky high!", "Jump!", "Yeah!"],
    duckSounds: ["Duck!", "Stay low!", "Dodge!", "Too close!", "Under!"],
    hitSounds: ["Whoa!", "Knocked out!", "Ouch!", "Ahhhh!"],
    quote: "Fast as lightning, sharp as steel!"
  },
  {
    id: "jet",
    name: "Jet",
    title: "Cyber Ninja",
    color: "#3b82f6", // Blue
    accentColor: "#93c5fd",
    avatarIcon: "🌀",
    jumpSounds: ["Leap!", "Up!", "Airborne!", "Fly!", "Hup!"],
    duckSounds: ["Low!", "Crouch!", "Slide!", "Missed me!", "Down!"],
    hitSounds: ["No way!", "System crash!", "Down!", "Whoops!"],
    quote: "You can't catch what you can't see."
  },
  {
    id: "naomi",
    name: "Naomi",
    title: "Vaporwave Queen",
    color: "#10b981", // Green/Emerald
    accentColor: "#6ee7b7",
    avatarIcon: "💎",
    jumpSounds: ["Boing!", "Over it!", "Higher!", "Hop!", "Easy!"],
    duckSounds: ["Under!", "Duck down!", "Swerve!", "Too low!", "Got it!"],
    hitSounds: ["Oh no!", "Bummer!", "Fell off!", "Catch me!"],
    quote: "Riding the neon frequency all the way to 200!"
  },
  {
    id: "dub",
    name: "Dub",
    title: "Heavy Beat Master",
    color: "#f59e0b", // Amber/Gold
    accentColor: "#fde047",
    avatarIcon: "🔥",
    jumpSounds: ["BOOM!", "High Jump!", "Up top!", "Air time!", "Power!"],
    duckSounds: ["Duck it!", "Low beat!", "Drop down!", "Flex!", "Underneath!"],
    hitSounds: ["Heavy hit!", "Wiped out!", "Whoa-hoa!", "Gravity wins!"],
    quote: "Keep the rhythm flowing up the spiral!"
  }
];
