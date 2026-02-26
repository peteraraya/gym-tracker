declare module '@capacitor/haptics' {
  export enum ImpactStyle {
    Light = "LIGHT",
    Medium = "MEDIUM",
    Heavy = "HEAVY",
  }

  export const Haptics: {
    impact(options: { style: ImpactStyle | string }): Promise<void>;
    notification(options: { type: string }): Promise<void>;
  };

  export {};
}
