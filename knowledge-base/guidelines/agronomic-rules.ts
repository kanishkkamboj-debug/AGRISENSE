import { AgronomicRule } from "../../shared/types/recommendation";

export const AGRONOMIC_RULES: AgronomicRule[] = [
  {
    id: "RULE_WATERLOGGING_001",
    version: "1.2.0",
    condition: "WATERLOGGING_RISK",
    action: {
      immediate: ["Stop irrigation immediately", "Open surface drainage channels on the lower field border", "Clear blocked drainage outlets"],
      doNot: ["Irrigate", "Broadcast nitrogen fertilizer into saturated standing water", "Apply foliar pesticides without active pest confirmation"],
      reassessMinutes: 360,
    },
    source: {
      organization: "Punjab Agricultural University (PAU)",
      title: "Package of Practices for Kharif Crops: Drainage & Soil Saturation Advisory",
      year: 2024,
      reference: "PAU-AGRO-2024-CH04",
      url: "https://www.pau.edu/advisories/drainage",
    },
    reviewedAt: "2026-01-15T00:00:00Z",
    status: "ACTIVE",
  },
  {
    id: "RULE_FLOOD_001",
    version: "1.1.0",
    condition: "FLOOD_RISK",
    action: {
      immediate: ["Assess standing water depth", "Drain surface water using portable pumps or gravity ditches", "Evaluate crop survival rate before applying inputs"],
      doNot: ["Apply urea while field is submerged", "Till wet clay soils immediately after water recedes"],
      reassessMinutes: 720,
    },
    source: {
      organization: "Indian Council of Agricultural Research (ICAR)",
      title: "Post-Flood Crop Management & Recovery Guidelines",
      year: 2023,
      reference: "ICAR-NDM-2023-REC02",
      url: "https://icar.org.in/disaster-management/flood",
    },
    reviewedAt: "2026-02-01T00:00:00Z",
    status: "ACTIVE",
  },
  {
    id: "RULE_DROUGHT_001",
    version: "1.0.0",
    condition: "DROUGHT_RISK",
    action: {
      immediate: ["Schedule micro-irrigation (drip/sprinkler) during early morning or evening hours", "Apply organic mulch around plant bases to conserve soil moisture"],
      doNot: ["Over-irrigate by flood method during peak sunshine", "Apply high-salt synthetic fertilizers under moisture deficit"],
      reassessMinutes: 720,
    },
    source: {
      organization: "Food and Agriculture Organization (FAO)",
      title: "Crop Water Requirements & Irrigation Management under Moisture Stress",
      year: 2022,
      reference: "FAO Irrigation and Drainage Paper 56",
      url: "https://www.fao.org/land-water/databases-and-software/cropwat",
    },
    reviewedAt: "2025-11-10T00:00:00Z",
    status: "ACTIVE",
  },
  {
    id: "RULE_NPK_N_001",
    version: "2.0.0",
    condition: "NUTRIENT_DEFICIENCY_RISK",
    action: {
      immediate: ["Verify soil moisture status before top-dressing nitrogen", "Apply split nitrogen dose according to growth stage requirement"],
      doNot: ["Apply nitrogen when heavy rainfall (>25mm) is forecasted within 24h", "Exceed stage-specific maximum N application rates"],
      reassessMinutes: 10080, // 7 days
    },
    source: {
      organization: "Indian Council of Agricultural Research (ICAR)",
      title: "Soil Test Based Integrated Nutrient Management System",
      year: 2023,
      reference: "ICAR-INM-BULLETIN-88",
    },
    reviewedAt: "2026-01-20T00:00:00Z",
    status: "ACTIVE",
  },
  {
    id: "RULE_IPM_SAFETY_001",
    version: "1.3.0",
    condition: "PEST_RISK",
    action: {
      immediate: ["Conduct field scouting to count pest density against economic threshold", "Deploy pheromone/light traps for monitoring", "Enforce mechanical/cultural controls before considering chemical spray"],
      doNot: ["Spray broad-spectrum chemicals below economic injury level", "Mix unauthorized chemical cocktails"],
      reassessMinutes: 2880,
    },
    source: {
      organization: "Food and Agriculture Organization (FAO)",
      title: "International Code of Conduct on Pesticide Management & IPM Guidelines",
      year: 2021,
      reference: "FAO-IPM-CODE-2021",
      url: "https://www.fao.org/pest-and-pesticide-management",
    },
    reviewedAt: "2025-12-05T00:00:00Z",
    status: "ACTIVE",
  },
];
