import type { MD3Colors as BaseMD3Colors } from "react-native-paper/src/types";
import type { CustomMD3Colors } from "./theme";

declare module "react-native-paper" {
  export type MD3Colors = BaseMD3Colors & CustomMD3Colors;
}
