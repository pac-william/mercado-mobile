import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Dimensions, Text } from "react-native";
import Swiper from "react-native-swiper";
import { getActiveCampaignsForCarousel, Campaign } from "../../services/campaignService";

const { width } = Dimensions.get("window");

const HeroBanner = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const activeCampaigns = await getActiveCampaignsForCarousel();

        const sortedCampaigns = activeCampaigns.sort((a, b) => a.slot - b.slot);
        setCampaigns(sortedCampaigns);
      } catch (error) {
        console.error("Erro ao buscar campanhas:", error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading || campaigns.length === 0) {
    return null;
  }

  if (campaigns.length === 1) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: campaigns[0].imageUrl }}
          style={styles.image}
          onError={(e) => {
            console.warn('Erro ao carregar banner:', campaigns[0].imageUrl);
          }}
        />
        <View style={styles.overlayText}>
          <Text style={styles.overlayTextContent}>Promovido por Mercado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        autoplay
        autoplayTimeout={10}
        showsPagination
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      >
        {campaigns.map((campaign) => (
          <View key={campaign.id} style={styles.slideContainer}>
            {campaign.imageUrl && !campaign.imageUrl.startsWith('blob:') ? (
              <>
                <Image
                  source={{ uri: campaign.imageUrl }}
                  style={styles.image}
                  onError={(e) => {
                    console.warn('Erro ao carregar banner:', campaign.imageUrl);
                  }}
                />
                <View style={styles.overlayText}>
                  <Text style={styles.overlayTextContent}>Promovido por Mercado</Text>
                </View>
              </>
            ) : null}
          </View>
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
    marginTop: 10,
    position: "relative",
  },
  slideContainer: {
    width: width - 32,
    height: 180,
    position: "relative",
  },
  image: {
    width: width - 32,
    height: 180,
    borderRadius: 12,
    resizeMode: "cover",
  },
  overlayText: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  overlayTextContent: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
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
