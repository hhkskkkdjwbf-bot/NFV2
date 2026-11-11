import { GeneratorId } from '../types';
import { NameInsightCategory } from '../types/nameInsight';

const BRAND_IDS = new Set<GeneratorId>([
  'brand','business','product','startup','shop','domain','app','feature','service','slogan',
  'clothing_brand','jewelry_brand','cosmetics_brand','coffee_shop','bakery',
  'food_truck','fitness_studio','travel_agency','real_estate','architecture_studio',
  'interior_decor','photo_studio','wedding_planner','marketing_agency','ecommerce_store',
  'specialty_coffee','artisanal_bakery','luxury_perfume','architect_firm','eco_fashion',
  'cocktail_lounge','green_energy_corp','microbrewery_craft','fintech_app','wellness_spa',
  'ai_megacorp','crypto_token','handle'
]);

const CHARACTER_IDS = new Set<GeneratorId>([
  'character','anime','anime_hero','anime_rival','fictional_mentor','magical_girl','mecha_pilot','anime_school','bio_chimera','anime_faction',
  'baby_name','pet_name','detective_noir','steampunk_inventor','space_pirate','alchemist_healer',
  'court_diplomat','gladiator_champion','wandering_bard','cyber_medic','smuggler_pilot',
  'mystic_oracle','cyber_hacker','cyborg_bounty_hunter','bounty_hunter_guild','nordic_valkyrie',
  'celtic_druid','vampire','vampire_coven','griffin_rider','desert_djinn','gargoyle_sentinel',
  'undead_lich','elemental_golem','predatory_raptor','pet_name'
]);

const RPG_IDS = new Set<GeneratorId>([
  'rpg','fantasy','elf','dragon','kingdom','warrior','wizard','vampire','boss','spell','tavern',
  'dungeon','guild','clan_name','secret_order','sky_citadel','mythic_creature','monster_beast',
  'magic_relic','spirit_guardian','griffin_rider','abyssal_leviathan','phoenix_flame',
  'enchanted_forest','sacred_artifact','shadow_assassin_guild','elemental_golem','royal_knight_order',
  'dwarven_citadel','elven_sanctuary','magical_academy','epic_quest_name','magic_potion',
  'raid_dungeon_boss','legendary_armor','tcg_card_spell','elemental_power'
]);

const GAME_IDS = new Set<GeneratorId>([
  'gaming','gamertag','videogame','indie_game_studio','game_dev_studio','esport_team_pro',
  'moba_champion','survival_server','mmorpg_server_realm','retro_arcade_cabinet','board_game',
  'boardgame_title','speedrun_marathon','loot_box_tier','sports_team','server_cluster'
]);

const SCIFI_IDS = new Set<GeneratorId>([
  'sci-fi','starship','mecha','cyberpunk','steampunk','alien_species','planet','starship',
  'orbital_station','quantum_reactor','terraformed_colony','interstellar_corridor','exoplanet_biodome',
  'deep_space_probe','nanotech_swarm','neural_interface','dystopian_city_sector','space_telescope',
  'interstellar_empire','floating_skyland','sunken_atlantis','space_pirate','smuggler_pilot'
]);

const SCIENCE_IDS = new Set<GeneratorId>([
  'math_app','math_puzzle','fictional_theorem','geometric_object','fractal_pattern','number_system',
  'scientific_model','science_popularization','deep_learning_model','quantum_particle',
  'cryptographic_protocol','astronomy_constellation','research_project','scientific_expedition',
  'crystal_mineral','luminescent_fungi','math_olympiad_team'
]);

const PROJECT_IDS = new Set<GeneratorId>([
  'project','framework','event','ai_bot','software_tool','browser_extension','ai_agent_workflow',
  'opensource_project','code_library','api_service','database_engine','cloud_platform','cyber_lab',
  'educational_project','charity_ngo','coworking_space','newsletter','blog_name','podcast',
  'youtube','streaming_channel','publishing_house','novel_series','comic_manga_series',
  'band_name','album_title','song_title','webradio_station','hackathon_team','creative_workshop',
  'online_course','study_group','personal_portfolio','local_association','eco_initiative',
  'open_source_framework','literary_magazine','experimental_cinema','indie_music_label',
  'ted_talk_theme','educational_escape_game','book','calendar_era','community','creative_coworking','festival_event','os_system','sprint_ritual'
]);

const PLACE_IDS = new Set<GeneratorId>([
  'placename','restaurant','hotel_name','exotic_resort','enchanted_forest','mountain_summit',
  'coral_reef','wild_sanctuary','volcanic_geyser','desert_oasis','ancient_tree','deep_sea_species',
  'arctic_creature','tropical_rainforest','floating_skyland','dwarven_citadel','elven_sanctuary',
  'sunken_atlantis','desert_empire','frozen_fjord','pirate_haven','merchant_crossroad',
  'haunted_manor','forbidden_wasteland','ancient_pyramid_tomb','culinary','carnivorous_plant'
]);

// Deliberately omit generators whose subject is weapons, attacks, or tactical operations.
export const NAME_INSIGHT_EXCLUDED_GENERATORS = new Set<string>([
  'weapon',
  'plasma_weapon',
  'tactical_operation',
  'special_attack'
]);

export function isNameInsightSupported(generatorId: GeneratorId): boolean {
  return !NAME_INSIGHT_EXCLUDED_GENERATORS.has(generatorId);
}

export function resolveNameInsightCategory(generatorId: GeneratorId): NameInsightCategory {
  if (BRAND_IDS.has(generatorId)) return 'brand';
  if (CHARACTER_IDS.has(generatorId)) return 'character';
  if (RPG_IDS.has(generatorId)) return 'rpg';
  if (GAME_IDS.has(generatorId)) return 'game';
  if (SCIFI_IDS.has(generatorId)) return 'science-fiction';
  if (SCIENCE_IDS.has(generatorId)) return 'science';
  if (PROJECT_IDS.has(generatorId)) return 'project';
  if (PLACE_IDS.has(generatorId)) return 'place';
  return 'general';
}

export const NAME_INSIGHT_CATEGORY_LABELS: Record<NameInsightCategory, string> = {
  brand: 'Brand & identity',
  character: 'Character concept',
  rpg: 'Fantasy & role-playing',
  game: 'Gaming identity',
  'science-fiction': 'Science-fiction universe',
  science: 'Science & discovery',
  project: 'Project & innovation',
  place: 'Place & worldbuilding',
  general: 'Creative concept'
};

export const NAME_INSIGHT_PALETTES: [string, string, string][] = [
  ['#2563EB', '#38BDF8', '#A78BFA'],
  ['#0F766E', '#2DD4BF', '#A3E635'],
  ['#7C3AED', '#C084FC', '#F0ABFC'],
  ['#B45309', '#F59E0B', '#FDE68A'],
  ['#BE123C', '#FB7185', '#FDA4AF'],
  ['#334155', '#64748B', '#CBD5E1'],
  ['#166534', '#4ADE80', '#BEF264'],
  ['#1D4ED8', '#818CF8', '#C4B5FD']
];

export const NAME_INSIGHT_ALTERNATIVE_SUFFIXES: Record<NameInsightCategory, string[]> = {
  brand: ['Studio', 'Works', 'Collective'],
  character: ['the Wanderer', 'of the Dawn', 'the Unbound'],
  rpg: ['of the Vale', 'the Far-Seer', 'of the Ember'],
  game: ['Prime', 'Arc', 'Nova'],
  'science-fiction': ['Protocol', 'Nexus', 'Orbit'],
  science: ['Model', 'Vector', 'Principle'],
  project: ['Lab', 'Initiative', 'Project'],
  place: ['Haven', 'Reach', 'Sanctuary'],
  general: ['Nova', 'Origins', 'Horizon']
};
