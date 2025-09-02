import { View, Text, Image } from "react-native";
import { ShoppingCart } from "lucide-react-native";

export function Header() {
  return (
    <View className="bg-blue-500 p-4 flex-row items-center justify-between">
      <Image source={{ uri: "https://via.placeholder.com/150" }} className="w-10 h-10" />
      <Text className="text-white text-xl font-bold">Smart Market</Text>
    </View>
  );
}


