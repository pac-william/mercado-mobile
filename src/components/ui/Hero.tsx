import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Dimensions, Text } from "react-native";
import Swiper from "react-native-swiper";
import { getActiveCampaignsForCarousel, Campaign } from "../../services/campaignService";
import { getMarketById } from "../../services/marketService";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from "../../constants/styles";

const { width } = Dimensions.get("window");

const HeroBanner = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [marketNames, setMarketNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const activeCampaigns = await getActiveCampaignsForCarousel();

        const sortedCampaigns = activeCampaigns.sort((a, b) => a.slot - b.slot);
        setCampaigns(sortedCampaigns);

        const uniqueMarketIds = [...new Set(sortedCampaigns.map(c => c.marketId))];
        const marketNamesMap: Record<string, string> = {};
        
        await Promise.all(
          uniqueMarketIds.map(async (marketId) => {
            try {
              const market = await getMarketById(marketId);
              marketNamesMap[marketId] = market.name;
            } catch (error) {
              console.error(`Erro ao buscar mercado ${marketId}:`, error);
              marketNamesMap[marketId] = "Mercado";
            }
          })
        );
        
        setMarketNames(marketNamesMap);
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
          <Text style={styles.overlayTextContent}>Promovido por {marketNames[campaigns[0].marketId] || "Mercado"}</Text>
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
                  <Text style={styles.overlayTextContent}>Promovido por {marketNames[campaign.marketId] || "Mercado"}</Text>
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
    borderRadius: BORDER_RADIUS.lg,
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
    borderRadius: BORDER_RADIUS.lg,
    resizeMode: "cover",
  },
  overlayText: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  overlayTextContent: {
    color: "#FFFFFF",
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  dot: {
    backgroundColor: "rgba(255,255,255,0.5)",
    width: ICON_SIZES.xs,
    height: ICON_SIZES.xs,
    borderRadius: BORDER_RADIUS.xs,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#EA1D2C", 
    width: ICON_SIZES.xs,
    height: ICON_SIZES.xs,
    borderRadius: BORDER_RADIUS.xs,
    marginHorizontal: 3,
  },
});

export default HeroBanner;
