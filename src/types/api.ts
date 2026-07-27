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

export interface EnkaAvatarDetail {
  avatarId: number;
  level: number;
  promotion: number;
  rank: number;
  equipment?: EnkaEquipment;
  relicList?: EnkaRelic[];
  _statsMap: Record<string, number>;
}

export interface EnkaEquipment {
  tid: number;
  level: number;
  promotion: number;
  rank: number;
}

export interface EnkaRelic {
  tid: number;
  type: number;
  level: number;
  mainAffixId: number;
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
  icon: string;
}
