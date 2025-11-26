import type { MD3Colors as BaseMD3Colors, MD3Theme } from "react-native-paper/src/types";

export interface CustomMD3Colors extends BaseMD3Colors {
  surfaceLight: string;
  outlineLight: string;
  accent: string;
  errorBackground: string;
  errorText: string;
  white: string;
  successIcon: string;
  successBackground: string;
  warningIcon: string;
  warningBackground: string;
  infoIcon: string;
  infoBackground: string;
  modalOverlay: string;
  modalShadow: string;
  modalSurface: string;
  textSecondary: string;
  buttonPrimary: string;
  buttonDanger: string;
  buttonSuccess: string;
  statusPending: string;
  statusConfirmed: string;
  statusPreparing: string;
  statusOutForDelivery: string;
  statusDelivered: string;
  statusCancelled: string;
  statusDefault: string;
  textShadow: string;
  discountBadge: string;
  favoriteIcon: string;
  favoriteText: string;
  borderLight: string;
  overlayLight: string;
}

export interface CustomMD3Theme extends Omit<MD3Theme, "colors"> {
  colors: CustomMD3Colors;
}

