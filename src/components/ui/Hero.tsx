import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

const banners = [
  "https://tangerin.vteximg.com.br/arquivos/ids/160085/BANNER-IFOOD-1920x500.jpg?v=637763988472670000",
  "https://tangerin.vteximg.com.br/arquivos/ids/160085/BANNER-IFOOD-1920x500.jpg?v=637763988472670000",
  "https://tangerin.vteximg.com.br/arquivos/ids/160085/BANNER-IFOOD-1920x500.jpg?v=637763988472670000",
];

const HeroBanner = () => {
  return (
    <View style={styles.container}>
      <Swiper
        autoplay
        autoplayTimeout={3}
        showsPagination
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      >
        {banners.map((banner, index) => (
          <Image key={index} source={{ uri: banner }} style={styles.image} />
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 16,
    marginTop: 10,
  },
  image: {
    width: width - 32,
    height: 180,
    borderRadius: 12,
    resizeMode: "cover",
  },
  dot: {
    backgroundColor: "rgba(255,255,255,0.5)",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#EA1D2C", 
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
});

export default HeroBanner;
