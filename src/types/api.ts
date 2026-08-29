export interface EnkaApiResponse {
  detailInfo: EnkaDetailInfo;
}

export interface EnkaDetailInfo {
  uid: number;
  nickname: string;
  level: number;
  worldLevel: number;
  friendCount: number;
  headIcon: number;
  signature: string;
  isDisplayAvatar: boolean;
  avatarDetailList: EnkaAvatarDetail[];
}

export interface EnkaSkillTreePoint {
  pointId: number;
  level: number;
}

export interface EnkaAvatarDetail {
  avatarId: number;
  level: number;
  promotion: number;
  rank: number;
  equipment?: EnkaEquipment;
  relicList?: EnkaRelic[];
  skillTreeList?: EnkaSkillTreePoint[];
  _statsMap?: Record<string, number>;
}

export interface EnkaFlatProp {
  type: string;
  value: number;
}

export interface EnkaFlat {
  props: EnkaFlatProp[];
}

export interface EnkaEquipment {
  tid: number;
  level: number;
  promotion: number;
  rank: number;
  _flat?: EnkaFlat;
}

export interface EnkaSubAffix {
  affixId: number;
  cnt: number;
  step?: number;
}

export interface EnkaRelic {
  tid: number;
  type: number;
  level: number;
  mainAffixId: number;
  subAffixList?: EnkaSubAffix[];
  _flat?: EnkaFlat;
}

export interface StarRailResCharacter {
  id: string;
  name: string;
  rarity: number;
  path: string;
  element: string;
  max_sp: number;
  icon: string;
}

export interface StarRailResLightCone {
  id: string;
  name: string;
  rarity: number;
  path: string;
  icon: string;
}

export interface StarRailResRelic {
  id: string;
  name: string;
  set_id: string;
  rarity: number;
  type: string;
  icon: string;
}

export interface StarRailResRelicSet {
  id: string;
  name: string;
  desc: string[];
  properties: StarRailResStatProperty[][];
  icon: string;
}

export interface StarRailResStatProperty {
  type: string;
  value: number;
}

export interface StarRailResSkillTreeLevel {
  promotion: number;
  level: number;
  properties: StarRailResStatProperty[];
}

export interface StarRailResSkillTree {
  id: string;
  name: string;
  max_level: number;
  anchor: string;
  levels: StarRailResSkillTreeLevel[];
  icon: string;
}

export interface StarRailResLightConeRank {
  id: string;
  skill: string;
  desc: string;
  params: number[][];
  properties: StarRailResStatProperty[][];
}
