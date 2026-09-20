import { CropProfile } from "../../shared/types/agriculture";

export const CROP_PROFILES: Record<string, CropProfile> = {
  wheat: {
    id: "wheat",
    name: "Wheat",
    scientificName: "Triticum aestivum",
    category: "CEREAL",
    varieties: ["HD-2967", "PBW-343", "DBW-187", "HD-3086"],
    soil: {
      preferredPH: { min: 6.0, max: 7.5 },
      preferredTexture: ["Loam", "Clay Loam", "Silt Loam"],
      moisture: { min: 35, max: 65 },
    },
    temperature: { min: 10, max: 25, optimal: 20 },
    humidity: { min: 40, max: 70 },
    nutrients: {
      n: { min: 30, max: 120, optimal: 90 },
      p: { min: 15, max: 60, optimal: 40 },
      k: { min: 15, max: 40, optimal: 30 },
      micronutrients: {
        zinc: { min: 1.0, max: 5.0 },
      },
    },
    plantingWindow: { startMonth: 10, endMonth: 12 },
    growthStages: [
      {
        id: "germination",
        name: "Crown Root Initiation (CRI)",
        stageOrder: 1,
        durationDays: 21,
        waterRequirementMmDay: 3.5,
        nutrientRequirement: { n: { min: 20, max: 40 }, p: { min: 20, max: 40 }, k: { min: 15, max: 30 } },
        stressSensitivities: { drought: "HIGH", waterlogging: "HIGH", heat: "MEDIUM" },
      },
      {
        id: "tillering",
        name: "Tillering",
        stageOrder: 2,
        durationDays: 25,
        waterRequirementMmDay: 4.0,
        nutrientRequirement: { n: { min: 40, max: 60 }, p: { min: 10, max: 20 }, k: { min: 10, max: 20 } },
        stressSensitivities: { drought: "MEDIUM", waterlogging: "HIGH", heat: "MEDIUM" },
      },
      {
        id: "flowering",
        name: "Flowering & Grain Filling",
        stageOrder: 3,
        durationDays: 35,
        waterRequirementMmDay: 5.0,
        nutrientRequirement: { n: { min: 20, max: 30 }, p: { min: 10, max: 15 }, k: { min: 10, max: 15 } },
        stressSensitivities: { drought: "HIGH", waterlogging: "MEDIUM", heat: "CRITICAL" },
      },
    ],
    stressConditions: ["DROUGHT_STRESS", "HEAT_STRESS_GRAIN_FILLING", "WATERLOGGING_CRI"],
    diseaseRisks: ["Yellow Rust", "Brown Rust", "Karnal Bunt"],
    pestRisks: ["Aphids", "Termites"],
    weedRisks: ["Phalaris minor", "Chenopodium album"],
    recommendations: [
      "Ensure CRI stage (21 days post-sowing) receives timely light irrigation.",
      "Avoid excess nitrogen top-dressing during humid periods to prevent lodging and rust.",
    ],
  },

  rice: {
    id: "rice",
    name: "Rice / Paddy",
    scientificName: "Oryza sativa",
    category: "CEREAL",
    varieties: ["Pusa-44", "PR-126", "Basmati-370", "Swarna"],
    soil: {
      preferredPH: { min: 5.5, max: 7.0 },
      preferredTexture: ["Clay", "Clay Loam"],
      moisture: { min: 60, max: 95 },
    },
    temperature: { min: 20, max: 35, optimal: 28 },
    humidity: { min: 60, max: 90 },
    nutrients: {
      n: { min: 40, max: 150, optimal: 120 },
      p: { min: 20, max: 60, optimal: 45 },
      k: { min: 20, max: 60, optimal: 40 },
    },
    plantingWindow: { startMonth: 6, endMonth: 7 },
    growthStages: [
      {
        id: "nursery",
        name: "Nursery & Transplanting",
        stageOrder: 1,
        durationDays: 25,
        waterRequirementMmDay: 8.0,
        nutrientRequirement: { n: { min: 30, max: 40 }, p: { min: 30, max: 40 }, k: { min: 20, max: 30 } },
        stressSensitivities: { drought: "CRITICAL", waterlogging: "LOW", heat: "MEDIUM" },
      },
      {
        id: "vegetative",
        name: "Active Tillering",
        stageOrder: 2,
        durationDays: 35,
        waterRequirementMmDay: 7.0,
        nutrientRequirement: { n: { min: 50, max: 70 }, p: { min: 10, max: 20 }, k: { min: 15, max: 25 } },
        stressSensitivities: { drought: "HIGH", waterlogging: "LOW", heat: "MEDIUM" },
      },
      {
        id: "panicle",
        name: "Panicle Initiation & Flowering",
        stageOrder: 3,
        durationDays: 30,
        waterRequirementMmDay: 8.5,
        nutrientRequirement: { n: { min: 20, max: 30 }, p: { min: 10, max: 15 }, k: { min: 15, max: 20 } },
        stressSensitivities: { drought: "CRITICAL", waterlogging: "MEDIUM", heat: "HIGH" },
      },
    ],
    stressConditions: ["DROUGHT_AT_PANICLE", "SUBMERGENCE_STRESS"],
    diseaseRisks: ["Bacterial Leaf Blight", "Sheath Blight", "Blast"],
    pestRisks: ["Stem Borer", "Brown Plant Hopper (BPH)"],
    weedRisks: ["Echinochloa crus-galli", "Cyperus rotundus"],
    recommendations: [
      "Maintain 2-5 cm standing water during panicle initiation stage.",
      "Adopt alternate wetting and drying (AWD) technique during vegetative stage to save water.",
    ],
  },

  maize: {
    id: "maize",
    name: "Maize / Corn",
    scientificName: "Zea mays",
    category: "CEREAL",
    varieties: ["PMH-1", "Bio-9681", "COH-3"],
    soil: {
      preferredPH: { min: 5.8, max: 7.2 },
      preferredTexture: ["Sandy Loam", "Loam"],
      moisture: { min: 40, max: 70 },
    },
    temperature: { min: 18, max: 32, optimal: 25 },
    humidity: { min: 45, max: 75 },
    nutrients: {
      n: { min: 40, max: 150, optimal: 120 },
      p: { min: 20, max: 60, optimal: 40 },
      k: { min: 20, max: 60, optimal: 40 },
    },
    plantingWindow: { startMonth: 6, endMonth: 7 },
    growthStages: [
      {
        id: "knee_high",
        name: "Knee-High Stage",
        stageOrder: 1,
        durationDays: 30,
        waterRequirementMmDay: 4.5,
        nutrientRequirement: { n: { min: 40, max: 60 }, p: { min: 20, max: 30 }, k: { min: 20, max: 30 } },
        stressSensitivities: { drought: "HIGH", waterlogging: "CRITICAL", heat: "MEDIUM" },
      },
      {
        id: "tasseling",
        name: "Tasseling & Silking",
        stageOrder: 2,
        durationDays: 20,
        waterRequirementMmDay: 6.5,
        nutrientRequirement: { n: { min: 40, max: 50 }, p: { min: 10, max: 15 }, k: { min: 10, max: 15 } },
        stressSensitivities: { drought: "CRITICAL", waterlogging: "CRITICAL", heat: "HIGH" },
      },
    ],
    stressConditions: ["WATERLOGGING_KNEE_HIGH", "DROUGHT_AT_SILKING"],
    diseaseRisks: ["Turcicum Leaf Blight", "Maydis Leaf Blight", "Charcoal Rot"],
    pestRisks: ["Fall Armyworm (FAW)", "Stem Borer"],
    weedRisks: ["Trianthema portulacastrum", "Eleusine indica"],
    recommendations: [
      "Extremely sensitive to root-zone saturation; ensure quick surface drainage after heavy rains.",
      "Do not apply nitrogen fertilizer into waterlogged soil.",
    ],
  },

  cotton: {
    id: "cotton",
    name: "Cotton",
    scientificName: "Gossypium hirsutum",
    category: "CASH_CROP",
    varieties: ["Bt-Cotton", "RCH-659"],
    soil: {
      preferredPH: { min: 6.0, max: 8.0 },
      preferredTexture: ["Deep Black Cotton Soil", "Clay Loam"],
      moisture: { min: 35, max: 65 },
    },
    temperature: { min: 21, max: 35, optimal: 27 },
    humidity: { min: 40, max: 70 },
    nutrients: {
      n: { min: 30, max: 120, optimal: 90 },
      p: { min: 15, max: 50, optimal: 30 },
      k: { min: 15, max: 60, optimal: 45 },
    },
    plantingWindow: { startMonth: 4, endMonth: 6 },
    growthStages: [
      {
        id: "vegetative",
        name: "Vegetative & Squaring",
        stageOrder: 1,
        durationDays: 45,
        waterRequirementMmDay: 4.0,
        nutrientRequirement: { n: { min: 30, max: 50 }, p: { min: 20, max: 30 }, k: { min: 20, max: 30 } },
        stressSensitivities: { drought: "MEDIUM", waterlogging: "HIGH", heat: "MEDIUM" },
      },
      {
        id: "boll_formation",
        name: "Flowering & Boll Formation",
        stageOrder: 2,
        durationDays: 60,
        waterRequirementMmDay: 6.0,
        nutrientRequirement: { n: { min: 40, max: 60 }, p: { min: 10, max: 20 }, k: { min: 20, max: 30 } },
        stressSensitivities: { drought: "HIGH", waterlogging: "HIGH", heat: "HIGH" },
      },
    ],
    stressConditions: ["BOLL_SHEDDING_WATERLOGGING", "MAGNESIUM_DEFICIENCY"],
    diseaseRisks: ["Cotton Leaf Curl Virus (CLCuV)", "Fusarium Wilt"],
    pestRisks: ["Pink Bollworm", "Whitefly", "Thrips"],
    weedRisks: ["Digera arvensis", "Echinocloa spp."],
    recommendations: [
      "Monitor whitefly populations closely as vectors for leaf curl virus.",
      "Avoid excessive nitrogen late in season to prevent rank vegetative growth.",
    ],
  },

  sugarcane: {
    id: "sugarcane",
    name: "Sugarcane",
    scientificName: "Saccharum officinarum",
    category: "CASH_CROP",
    varieties: ["Co-0238", "Co-86032"],
    soil: { preferredPH: { min: 6.5, max: 7.5 }, preferredTexture: ["Deep Loam", "Clay Loam"], moisture: { min: 45, max: 80 } },
    temperature: { min: 20, max: 38, optimal: 30 },
    humidity: { min: 50, max: 85 },
    nutrients: { n: { min: 50, max: 250, optimal: 180 }, p: { min: 30, max: 80, optimal: 60 }, k: { min: 30, max: 120, optimal: 90 } },
    plantingWindow: { startMonth: 2, endMonth: 4 },
    growthStages: [
      { id: "formative", name: "Formative Stage", stageOrder: 1, durationDays: 120, waterRequirementMmDay: 7.0, nutrientRequirement: { n: { min: 80, max: 100 }, p: { min: 40, max: 60 }, k: { min: 40, max: 50 } }, stressSensitivities: { drought: "HIGH", waterlogging: "MEDIUM", heat: "HIGH" } },
      { id: "grand_growth", name: "Grand Growth Stage", stageOrder: 2, durationDays: 150, waterRequirementMmDay: 8.0, nutrientRequirement: { n: { min: 60, max: 80 }, p: { min: 20, max: 30 }, k: { min: 40, max: 60 } }, stressSensitivities: { drought: "HIGH", waterlogging: "LOW", heat: "MEDIUM" } }
    ],
    stressConditions: ["DROUGHT_FORMATIVE", "MOISTURE_DEFICIT"],
    diseaseRisks: ["Red Rot", "Smut"],
    pestRisks: ["Early Shoot Borer", "Top Borer"],
    weedRisks: ["Cyperus rotundus"],
    recommendations: ["Ensure adequate irrigation during formative phase to prevent yield reduction."]
  },

  soybean: {
    id: "soybean",
    name: "Soybean",
    scientificName: "Glycine max",
    category: "OILSEED",
    varieties: ["JS-335", "JS-9560", "NRC-37"],
    soil: { preferredPH: { min: 6.0, max: 7.5 }, preferredTexture: ["Medium to Deep Black Soil", "Loam"], moisture: { min: 35, max: 65 } },
    temperature: { min: 18, max: 32, optimal: 26 },
    humidity: { min: 45, max: 75 },
    nutrients: { n: { min: 15, max: 30, optimal: 20 }, p: { min: 20, max: 80, optimal: 60 }, k: { min: 15, max: 50, optimal: 40 } },
    plantingWindow: { startMonth: 6, endMonth: 7 },
    growthStages: [
      { id: "flowering", name: "Flowering & Pod Filling", stageOrder: 1, durationDays: 40, waterRequirementMmDay: 5.0, nutrientRequirement: { n: { min: 10, max: 15 }, p: { min: 30, max: 40 }, k: { min: 20, max: 30 } }, stressSensitivities: { drought: "HIGH", waterlogging: "HIGH", heat: "MEDIUM" } }
    ],
    stressConditions: ["WATERLOGGING_GERMINATION", "MOISTURE_STRESS_POD_FILL"],
    diseaseRisks: ["Yellow Mosaic Virus", "Charcoal Rot"],
    pestRisks: ["Girdle Beetle", "Tobacco Caterpillar"],
    weedRisks: ["Echinochloa spp."],
    recommendations: ["Ensure Rhizobium seed treatment before sowing."]
  },

  potato: {
    id: "potato",
    name: "Potato",
    scientificName: "Solanum tuberosum",
    category: "VEGETABLE",
    varieties: ["Kufri Jyoti", "Kufri Pukhraj", "Kufri Bahar"],
    soil: { preferredPH: { min: 5.2, max: 6.5 }, preferredTexture: ["Well-drained Sandy Loam"], moisture: { min: 50, max: 75 } },
    temperature: { min: 12, max: 24, optimal: 18 },
    humidity: { min: 50, max: 80 },
    nutrients: { n: { min: 40, max: 180, optimal: 140 }, p: { min: 30, max: 100, optimal: 80 }, k: { min: 40, max: 150, optimal: 120 } },
    plantingWindow: { startMonth: 10, endMonth: 11 },
    growthStages: [
      { id: "tuberization", name: "Tuber Initiation & Bulking", stageOrder: 1, durationDays: 50, waterRequirementMmDay: 5.5, nutrientRequirement: { n: { min: 60, max: 80 }, p: { min: 40, max: 50 }, k: { min: 60, max: 80 } }, stressSensitivities: { drought: "HIGH", waterlogging: "CRITICAL", heat: "CRITICAL" } }
    ],
    stressConditions: ["HIGH_TEMP_TUBERIZATION_HALT", "LATE_BLIGHT_FAVORABLE"],
    diseaseRisks: ["Late Blight", "Early Blight"],
    pestRisks: ["Aphids", "Potato Tuber Moth"],
    weedRisks: ["Chenopodium album"],
    recommendations: ["Maintain ridging to prevent tuber exposure and late blight spread."]
  },

  tomato: {
    id: "tomato",
    name: "Tomato",
    scientificName: "Solanum lycopersicum",
    category: "VEGETABLE",
    varieties: ["Arka Rakshak", "Pusa Ruby", "Abhinav"],
    soil: { preferredPH: { min: 6.0, max: 7.0 }, preferredTexture: ["Well-drained Sandy Loam"], moisture: { min: 45, max: 70 } },
    temperature: { min: 15, max: 30, optimal: 23 },
    humidity: { min: 45, max: 75 },
    nutrients: { n: { min: 30, max: 120, optimal: 90 }, p: { min: 20, max: 80, optimal: 60 }, k: { min: 30, max: 120, optimal: 90 } },
    plantingWindow: { startMonth: 8, endMonth: 11 },
    growthStages: [
      { id: "fruiting", name: "Flowering & Fruit Development", stageOrder: 1, durationDays: 60, waterRequirementMmDay: 5.0, nutrientRequirement: { n: { min: 40, max: 50 }, p: { min: 30, max: 40 }, k: { min: 40, max: 60 } }, stressSensitivities: { drought: "HIGH", waterlogging: "HIGH", heat: "HIGH" } }
    ],
    stressConditions: ["BLOSSOM_END_ROT_CALCIUM", "FRUIT_CRACKING_MOISTURE_FLUCTUATION"],
    diseaseRisks: ["Tomato Leaf Curl Virus", "Early Blight"],
    pestRisks: ["Fruit Borer", "Whitefly"],
    weedRisks: ["Cyperus rotundus"],
    recommendations: ["Maintain steady soil moisture to prevent fruit cracking."]
  },

  onion: {
    id: "onion",
    name: "Onion",
    scientificName: "Allium cepa",
    category: "VEGETABLE",
    varieties: ["Agrifound Dark Red", "N-53", "Bhima Super"],
    soil: { preferredPH: { min: 6.0, max: 7.2 }, preferredTexture: ["Sandy Loam", "Friable Loam"], moisture: { min: 40, max: 65 } },
    temperature: { min: 13, max: 28, optimal: 20 },
    humidity: { min: 40, max: 70 },
    nutrients: { n: { min: 30, max: 100, optimal: 80 }, p: { min: 20, max: 50, optimal: 40 }, k: { min: 20, max: 80, optimal: 60 } },
    plantingWindow: { startMonth: 10, endMonth: 11 },
    growthStages: [
      { id: "bulb_dev", name: "Bulb Development", stageOrder: 1, durationDays: 50, waterRequirementMmDay: 4.5, nutrientRequirement: { n: { min: 30, max: 40 }, p: { min: 20, max: 30 }, k: { min: 30, max: 40 } }, stressSensitivities: { drought: "HIGH", waterlogging: "CRITICAL", heat: "HIGH" } }
    ],
    stressConditions: ["BULB_ROT_WATERLOGGING", "THRIPS_OUTBREAK_DRY"],
    diseaseRisks: ["Purple Blotch", "Stemphylium Blight"],
    pestRisks: ["Thrips"],
    weedRisks: ["Poa annua"],
    recommendations: ["Stop irrigation 10-15 days prior to harvest."]
  },

  groundnut: {
    id: "groundnut",
    name: "Groundnut / Peanut",
    scientificName: "Arachis hypogaea",
    category: "OILSEED",
    varieties: ["TAG-24", "TG-37A", "JL-24"],
    soil: { preferredPH: { min: 6.0, max: 7.0 }, preferredTexture: ["Sandy Loam", "Light Soil"], moisture: { min: 35, max: 60 } },
    temperature: { min: 22, max: 32, optimal: 27 },
    humidity: { min: 40, max: 70 },
    nutrients: { n: { min: 10, max: 25, optimal: 20 }, p: { min: 20, max: 60, optimal: 40 }, k: { min: 15, max: 50, optimal: 30 } },
    plantingWindow: { startMonth: 6, endMonth: 7 },
    growthStages: [
      { id: "pegging", name: "Pegging & Pod Formation", stageOrder: 1, durationDays: 45, waterRequirementMmDay: 5.0, nutrientRequirement: { n: { min: 10, max: 15 }, p: { min: 20, max: 30 }, k: { min: 20, max: 30 } }, stressSensitivities: { drought: "CRITICAL", waterlogging: "HIGH", heat: "MEDIUM" } }
    ],
    stressConditions: ["HARD_SOIL_PEGGING_RESTRICTION", "AFLATOXIN_DROUGHT"],
    diseaseRisks: ["Tikka Disease (Leaf Spot)", "Collar Rot"],
    pestRisks: ["Red Hairy Caterpillar", "Spodoptera"],
    weedRisks: ["Celosia argentea"],
    recommendations: ["Apply gypsum at pegging stage for adequate calcium."]
  },

  mustard: {
    id: "mustard",
    name: "Mustard / Rapeseed",
    scientificName: "Brassica juncea",
    category: "OILSEED",
    varieties: ["Pusa Bold", "RH-749", "NRCDR-02"],
    soil: { preferredPH: { min: 6.0, max: 7.5 }, preferredTexture: ["Loam", "Sandy Loam"], moisture: { min: 30, max: 55 } },
    temperature: { min: 10, max: 25, optimal: 18 },
    humidity: { min: 40, max: 65 },
    nutrients: { n: { min: 20, max: 80, optimal: 60 }, p: { min: 15, max: 40, optimal: 30 }, k: { min: 15, max: 40, optimal: 30 } },
    plantingWindow: { startMonth: 10, endMonth: 11 },
    growthStages: [
      { id: "flowering", name: "Flowering & Pod Formation", stageOrder: 1, durationDays: 40, waterRequirementMmDay: 3.5, nutrientRequirement: { n: { min: 30, max: 40 }, p: { min: 15, max: 20 }, k: { min: 15, max: 20 } }, stressSensitivities: { drought: "MEDIUM", waterlogging: "HIGH", heat: "HIGH" } }
    ],
    stressConditions: ["APHID_FAVORABLE_HUMID_COLD", "FROST_DAMAGE"],
    diseaseRisks: ["Alternaria Blight", "White Rust"],
    pestRisks: ["Mustard Aphid"],
    weedRisks: ["Orobanche"],
    recommendations: ["Apply sulfur for higher oil content."]
  },

  pulses: {
    id: "pulses",
    name: "Pulses / Chickpea",
    scientificName: "Cicer arietinum",
    category: "PULSE",
    varieties: ["JG-11", "JAKI-9218"],
    soil: { preferredPH: { min: 6.0, max: 7.8 }, preferredTexture: ["Well-drained Loam", "Clay Loam"], moisture: { min: 25, max: 50 } },
    temperature: { min: 12, max: 25, optimal: 20 },
    humidity: { min: 35, max: 60 },
    nutrients: { n: { min: 10, max: 20, optimal: 15 }, p: { min: 20, max: 60, optimal: 40 }, k: { min: 10, max: 30, optimal: 20 } },
    plantingWindow: { startMonth: 10, endMonth: 11 },
    growthStages: [
      { id: "podding", name: "Flowering & Podding", stageOrder: 1, durationDays: 45, waterRequirementMmDay: 3.0, nutrientRequirement: { n: { min: 5, max: 10 }, p: { min: 20, max: 30 }, k: { min: 10, max: 15 } }, stressSensitivities: { drought: "MEDIUM", waterlogging: "CRITICAL", heat: "HIGH" } }
    ],
    stressConditions: ["WILT_WATERLOGGED", "POD_BORER_RISK"],
    diseaseRisks: ["Fusarium Wilt", "Ascochyta Blight"],
    pestRisks: ["Helicoverpa armigera (Pod Borer)"],
    weedRisks: ["Chenopodium album"],
    recommendations: ["Avoid over-irrigation to prevent wilt infection."]
  },

  chili: {
    id: "chili",
    name: "Chili Pepper",
    scientificName: "Capsicum annuum",
    category: "VEGETABLE",
    varieties: ["G-4", "Pusa Jwala", "Byadgi"],
    soil: { preferredPH: { min: 6.0, max: 7.0 }, preferredTexture: ["Sandy Loam"], moisture: { min: 40, max: 65 } },
    temperature: { min: 18, max: 32, optimal: 25 },
    humidity: { min: 45, max: 75 },
    nutrients: { n: { min: 30, max: 120, optimal: 90 }, p: { min: 20, max: 60, optimal: 45 }, k: { min: 20, max: 75, optimal: 50 } },
    plantingWindow: { startMonth: 8, endMonth: 10 },
    growthStages: [
      { id: "fruiting", name: "Fruiting & Harvest", stageOrder: 1, durationDays: 60, waterRequirementMmDay: 4.5, nutrientRequirement: { n: { min: 40, max: 50 }, p: { min: 20, max: 30 }, k: { min: 25, max: 35 } }, stressSensitivities: { drought: "HIGH", waterlogging: "CRITICAL", heat: "HIGH" } }
    ],
    stressConditions: ["LEAF_CURL_VIRUS_VECTOR", "DAMPING_OFF"],
    diseaseRisks: ["Anthracnose / Dieback", "Powdery Mildew"],
    pestRisks: ["Chili Thrips", "Mites"],
    weedRisks: ["Cyperus spp."],
    recommendations: ["Ensure good drainage; chili roots rot rapidly in saturated soil."]
  },

  banana: {
    id: "banana",
    name: "Banana",
    scientificName: "Musa acuminata",
    category: "FRUIT",
    varieties: ["Grand Naine", "Robusta", "Dwarf Cavendish"],
    soil: { preferredPH: { min: 6.5, max: 7.5 }, preferredTexture: ["Deep Well-drained Loam"], moisture: { min: 55, max: 85 } },
    temperature: { min: 15, max: 38, optimal: 27 },
    humidity: { min: 60, max: 90 },
    nutrients: { n: { min: 50, max: 200, optimal: 150 }, p: { min: 20, max: 60, optimal: 40 }, k: { min: 80, max: 300, optimal: 200 } },
    plantingWindow: { startMonth: 6, endMonth: 8 },
    growthStages: [
      { id: "shooting", name: "Bunch Emergence & Development", stageOrder: 1, durationDays: 90, waterRequirementMmDay: 8.0, nutrientRequirement: { n: { min: 60, max: 80 }, p: { min: 15, max: 25 }, k: { min: 100, max: 150 } }, stressSensitivities: { drought: "HIGH", waterlogging: "HIGH", heat: "MEDIUM" } }
    ],
    stressConditions: ["SIGATOKA_HIGH_HUMIDITY", "POTASSIUM_DEFICIENCY"],
    diseaseRisks: ["Panama Wilt", "Sigatoka Leaf Spot"],
    pestRisks: ["Banana Stem Weevil", "Nematodes"],
    weedRisks: ["Broadleaf weeds"],
    recommendations: ["High potassium requirement during bunch development stage."]
  },

  apple: {
    id: "apple",
    name: "Apple",
    scientificName: "Malus domestica",
    category: "FRUIT",
    varieties: ["Red Delicious", "Royal Delicious", "Gala"],
    soil: { preferredPH: { min: 6.0, max: 7.0 }, preferredTexture: ["Deep Loam"], moisture: { min: 45, max: 70 } },
    temperature: { min: -5, max: 25, optimal: 18 },
    humidity: { min: 50, max: 75 },
    nutrients: { n: { min: 30, max: 100, optimal: 70 }, p: { min: 15, max: 50, optimal: 35 }, k: { min: 30, max: 120, optimal: 90 } },
    plantingWindow: { startMonth: 12, endMonth: 2 },
    growthStages: [
      { id: "fruit_dev", name: "Fruit Development", stageOrder: 1, durationDays: 100, waterRequirementMmDay: 5.0, nutrientRequirement: { n: { min: 30, max: 40 }, p: { min: 15, max: 20 }, k: { min: 40, max: 60 } }, stressSensitivities: { drought: "HIGH", waterlogging: "HIGH", heat: "CRITICAL" } }
    ],
    stressConditions: ["INSUFFICIENT_CHILLING_HOURS", "APPLE_SCAB_RISK"],
    diseaseRisks: ["Apple Scab", "Powdery Mildew"],
    pestRisks: ["San Jose Scale", "Codling Moth"],
    weedRisks: ["Perennial grasses"],
    recommendations: ["Monitor chilling requirement in winter months."]
  },

  citrus: {
    id: "citrus",
    name: "Citrus / Mandarin",
    scientificName: "Citrus reticulata",
    category: "FRUIT",
    varieties: ["Nagpur Mandarin", "Kinnow", "Acid Lime"],
    soil: { preferredPH: { min: 5.5, max: 7.5 }, preferredTexture: ["Well-drained Loam"], moisture: { min: 40, max: 65 } },
    temperature: { min: 13, max: 38, optimal: 25 },
    humidity: { min: 45, max: 75 },
    nutrients: { n: { min: 30, max: 150, optimal: 100 }, p: { min: 15, max: 60, optimal: 40 }, k: { min: 20, max: 100, optimal: 70 } },
    plantingWindow: { startMonth: 6, endMonth: 8 },
    growthStages: [
      { id: "fruit_growth", name: "Fruit Growth & Maturation", stageOrder: 1, durationDays: 120, waterRequirementMmDay: 5.5, nutrientRequirement: { n: { min: 40, max: 50 }, p: { min: 15, max: 25 }, k: { min: 30, max: 40 } }, stressSensitivities: { drought: "HIGH", waterlogging: "CRITICAL", heat: "MEDIUM" } }
    ],
    stressConditions: ["CITRUS_DECLINE", "IRON_CHLOROSIS_HIGH_PH"],
    diseaseRisks: ["Citrus Canker", "Gummosis"],
    pestRisks: ["Citrus Psylla", "Leaf Miner"],
    weedRisks: ["Broadleaf weeds"],
    recommendations: ["Prevent standing water around trunk to avoid gummosis."]
  },

  grape: {
    id: "grape",
    name: "Grape",
    scientificName: "Vitis vinifera",
    category: "FRUIT",
    varieties: ["Thomson Seedless", "Tas-A-Ganesh", "Bangalore Blue"],
    soil: { preferredPH: { min: 6.5, max: 8.0 }, preferredTexture: ["Sandy Loam"], moisture: { min: 35, max: 60 } },
    temperature: { min: 15, max: 35, optimal: 25 },
    humidity: { min: 35, max: 65 },
    nutrients: { n: { min: 20, max: 80, optimal: 50 }, p: { min: 15, max: 50, optimal: 30 }, k: { min: 30, max: 120, optimal: 90 } },
    plantingWindow: { startMonth: 10, endMonth: 11 },
    growthStages: [
      { id: "berry_dev", name: "Berry Development & Veraison", stageOrder: 1, durationDays: 70, waterRequirementMmDay: 4.5, nutrientRequirement: { n: { min: 20, max: 30 }, p: { min: 10, max: 20 }, k: { min: 40, max: 60 } }, stressSensitivities: { drought: "MEDIUM", waterlogging: "HIGH", heat: "MEDIUM" } }
    ],
    stressConditions: ["DOWNY_MILDEW_RAIN", "BERRY_CRACKING_RAIN"],
    diseaseRisks: ["Downy Mildew", "Powdery Mildew"],
    pestRisks: ["Mealybugs", "Thrips"],
    weedRisks: ["Cyperus spp."],
    recommendations: ["Prune carefully post-harvest; prevent leaf wetness during berry development."]
  },

  mango: {
    id: "mango",
    name: "Mango",
    scientificName: "Mangifera indica",
    category: "FRUIT",
    varieties: ["Alphonso", "Dasheri", "Langra", "Totapuri"],
    soil: { preferredPH: { min: 5.5, max: 7.5 }, preferredTexture: ["Deep Well-drained Loam"], moisture: { min: 35, max: 65 } },
    temperature: { min: 20, max: 40, optimal: 28 },
    humidity: { min: 40, max: 75 },
    nutrients: { n: { min: 30, max: 120, optimal: 80 }, p: { min: 15, max: 50, optimal: 30 }, k: { min: 30, max: 120, optimal: 80 } },
    plantingWindow: { startMonth: 7, endMonth: 9 },
    growthStages: [
      { id: "flowering_fruit", name: "Flowering & Fruit Set", stageOrder: 1, durationDays: 90, waterRequirementMmDay: 4.0, nutrientRequirement: { n: { min: 30, max: 40 }, p: { min: 15, max: 20 }, k: { min: 30, max: 40 } }, stressSensitivities: { drought: "MEDIUM", waterlogging: "HIGH", heat: "HIGH" } }
    ],
    stressConditions: ["POWDERY_MILDEW_FLOWERING", "ALT_BEARING"],
    diseaseRisks: ["Powdery Mildew", "Anthracnose"],
    pestRisks: ["Mango Hopper", "Mealybug"],
    weedRisks: ["Perennial weeds"],
    recommendations: ["Withhold irrigation during flower bud initiation."]
  },

  coffee: {
    id: "coffee",
    name: "Coffee",
    scientificName: "Coffea arabica / canephora",
    category: "PLANTATION",
    varieties: ["Arabica S-795", "Robusta CxR"],
    soil: { preferredPH: { min: 5.5, max: 6.5 }, preferredTexture: ["Deep Red Sandy Loam"], moisture: { min: 50, max: 80 } },
    temperature: { min: 15, max: 28, optimal: 22 },
    humidity: { min: 60, max: 85 },
    nutrients: { n: { min: 30, max: 140, optimal: 100 }, p: { min: 20, max: 60, optimal: 40 }, k: { min: 30, max: 140, optimal: 100 } },
    plantingWindow: { startMonth: 6, endMonth: 8 },
    growthStages: [
      { id: "berry_dev", name: "Blossom & Berry Development", stageOrder: 1, durationDays: 120, waterRequirementMmDay: 5.0, nutrientRequirement: { n: { min: 40, max: 50 }, p: { min: 15, max: 25 }, k: { min: 40, max: 50 } }, stressSensitivities: { drought: "HIGH", waterlogging: "MEDIUM", heat: "HIGH" } }
    ],
    stressConditions: ["BLOSSOM_DROUGHT", "LEAF_RUST_FAVORABLE"],
    diseaseRisks: ["Coffee Leaf Rust", "Black Rot"],
    pestRisks: ["Coffee Berry Borer", "White Stem Borer"],
    weedRisks: ["Broadleaf weeds"],
    recommendations: ["Requires blossom showers (25-40mm) in March-April."]
  },

  tea: {
    id: "tea",
    name: "Tea",
    scientificName: "Camellia sinensis",
    category: "PLANTATION",
    varieties: ["TV-1", "Tocklai Clones"],
    soil: { preferredPH: { min: 4.5, max: 5.5 }, preferredTexture: ["Acidic High-Organic Loam"], moisture: { min: 55, max: 85 } },
    temperature: { min: 13, max: 30, optimal: 22 },
    humidity: { min: 65, max: 90 },
    nutrients: { n: { min: 40, max: 160, optimal: 120 }, p: { min: 15, max: 50, optimal: 30 }, k: { min: 30, max: 120, optimal: 80 } },
    plantingWindow: { startMonth: 10, endMonth: 12 },
    growthStages: [
      { id: "flushing", name: "Active Flushing & Plucking", stageOrder: 1, durationDays: 180, waterRequirementMmDay: 6.0, nutrientRequirement: { n: { min: 60, max: 80 }, p: { min: 15, max: 20 }, k: { min: 40, max: 50 } }, stressSensitivities: { drought: "HIGH", waterlogging: "CRITICAL", heat: "HIGH" } }
    ],
    stressConditions: ["HIGH_SOIL_PH_ALKALINE", "BLISTER_BLIGHT"],
    diseaseRisks: ["Blister Blight", "Black Rot"],
    pestRisks: ["Tea Mosquito Bug", "Red Spider Mite"],
    weedRisks: ["Mikania micrantha"],
    recommendations: ["Requires acidic soil (pH 4.5-5.5); apply elemental sulfur if pH exceeds 5.8."]
  },
};
