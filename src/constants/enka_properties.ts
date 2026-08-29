// Map Enka API property keys to SDK stat names
export const ENKA_PROPERTY_MAP: Record<string, string> = {
  // Base stats (avatar-level, _statsMap style)
  "HPBase": "baseHp",
  "HPDelta": "flatHp",
  "HPAddedRatio": "percentHp",
  "AttackBase": "baseAtk",
  "AttackDelta": "flatAtk",
  "AttackAddedRatio": "percentAtk",
  "DefenceBase": "baseDef",
  "DefenceDelta": "flatDef",
  "DefenceAddedRatio": "percentDef",
  "SpeedBase": "baseSpeed",
  "SpeedDelta": "flatSpeed",
  "SpeedAddedRatio": "percentSpeed",
  "CriticalChanceBase": "critRate",
  "CriticalDamageBase": "critDmg",
  "StatusProbabilityBase": "effectHit",
  "StatusResistanceBase": "effectRes",
  "BreakDamageAddedRatioBase": "breakEffect",
  "SPRatioBase": "energyRecovery",

  // Equipment/Relic _flat.props style (no "Base" suffix)
  "BaseHP": "baseHp",
  "BaseAttack": "baseAtk",
  "BaseDefence": "baseDef",
  "CriticalChance": "critRate",
  "CriticalDamage": "critDmg",
  "StatusProbability": "effectHit",
  "StatusResistance": "effectRes",
  "BreakDamageAddedRatio": "breakEffect",
  "SPRatio": "energyRecovery",

  // Elemental damage boosts (same key in both formats)
  "PhysicalAddedRatio": "physicalDmgBoost",
  "FireAddedRatio": "fireDmgBoost",
  "IceAddedRatio": "iceDmgBoost",
  "ThunderAddedRatio": "lightningDmgBoost",
  "WindAddedRatio": "windDmgBoost",
  "QuantumAddedRatio": "quantumDmgBoost",
  "ImaginaryAddedRatio": "imaginaryDmgBoost",
  "AllDamageTypeAddedRatio": "allDmgBoost"
};
