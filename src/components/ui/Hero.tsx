import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Swiper from "react-native-swiper";
import { getActiveCampaignsForCarousel, Campaign } from "../../services/campaignService";
import { getMarketById } from "../../services/marketService";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from "../../constants/styles";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useResponsive } from "../../hooks/useResponsive";
import { useLoading } from "../../hooks/useLoading";
import { CachedImage } from "./CachedImage";

const HeroBanner = () => {
  const { colors } = useCustomTheme();
  const { width } = useResponsive();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [marketNames, setMarketNames] = useState<Record<string, string>>({});
  const { loading, execute } = useLoading({ initialValue: true });

  useEffect(() => {
    const fetchCampaigns = async () => {
      execute(async () => {
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
        }
      });
    };

    fetchCampaigns();
  }, [execute]);

  if (loading || campaigns.length === 0) {
    return null;
  }

  const imageWidth = width - SPACING.xxl;
  const imageHeight = SPACING.xxxl * 4 + SPACING.xlBase;

  if (campaigns.length === 1) {
    return (
      <View style={styles.container}>
        <CachedImage
          source={campaigns[0].imageUrl}
          style={[styles.image, { width: imageWidth, height: imageHeight }]}
          resizeMode="cover"
          cachePolicy="memory-disk"
          onError={() => {
            console.warn('Erro ao carregar banner:', campaigns[0].imageUrl);
          }}
        />
        <View style={[styles.overlayText, { backgroundColor: colors.modalOverlay }]}>
          <Text style={[styles.overlayTextContent, { color: colors.white }]}>
            Promovido por {marketNames[campaigns[0].marketId] || "Mercado"}
          </Text>
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
        dotStyle={[styles.dot, { backgroundColor: colors.overlayLight }]}
        activeDotStyle={[styles.activeDot, { backgroundColor: colors.accent }]}
      >
        {campaigns.map((campaign) => (
          <View key={campaign.id} style={[styles.slideContainer, { width: imageWidth, height: imageHeight }]}>
            {campaign.imageUrl && !campaign.imageUrl.startsWith('blob:') ? (
              <>
                <CachedImage
                  source={campaign.imageUrl}
                  style={[styles.image, { width: imageWidth, height: imageHeight }]}
                  resizeMode="cover"
                  cachePolicy="memory-disk"
                  onError={() => {
                    console.warn('Erro ao carregar banner:', campaign.imageUrl);
                  }}
                />
                <View style={[styles.overlayText, { backgroundColor: colors.modalOverlay }]}>
                  <Text style={[styles.overlayTextContent, { color: colors.white }]}>Promovido por {marketNames[campaign.marketId] || "Mercado"}</Text>
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
    height: SPACING.xxxl * 4 + SPACING.xlBase,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    marginTop: SPACING.smPlus,
    position: "relative",
  },
  slideContainer: {
    position: "relative",
  },
  image: {
    borderRadius: BORDER_RADIUS.lg,
    resizeMode: "cover",
  },
  overlayText: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xsPlus,
    borderRadius: BORDER_RADIUS.sm,
  },
  overlayTextContent: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  dot: {
    width: ICON_SIZES.xs,
    height: ICON_SIZES.xs,
    borderRadius: BORDER_RADIUS.xs,
    marginHorizontal: SPACING.micro + 1,
  },
  activeDot: {
    width: ICON_SIZES.xs,
    height: ICON_SIZES.xs,
    borderRadius: BORDER_RADIUS.xs,
    marginHorizontal: SPACING.micro + 1,
  },
});

export default HeroBanner;
