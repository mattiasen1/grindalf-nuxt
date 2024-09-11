export interface Skill {
    id: number;
    name: string;
    rank: number;
    level: number;
    xp: number;
}
  
export interface Activity {
    id: number;
    name: string;
    rank: number;
    score: number;
}
  
export interface HiscoreResponse {
    skills: Skill[];
    activities: Activity[];
}

export interface Item {
    name: string;
    droprate: number;
}