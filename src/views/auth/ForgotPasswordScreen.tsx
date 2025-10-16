import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Animated
} from "react-native";
import { TextInput, Button, ActivityIndicator } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Logo from "../../assets/logo1.jpg";
import { ForgotPasswordDTO } from "../../dtos/authDTO";
import { forgotPassword } from "../../services/authService";
import { HomeStackParamList } from "../../../App";

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<{ email?: string }>({});
    const [loading, setLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const validateForm = () => {
        try {
            ForgotPasswordDTO.parse({ email });
            setErrors({});
            return true;
        } catch (error: any) {
            const fieldErrors: { email?: string } = {};

            if (error.errors) {
                error.errors.forEach((err: any) => {
                    const field = err.path[0];
                    fieldErrors[field as keyof typeof fieldErrors] = err.message;
                });
            }

            setErrors(fieldErrors);
            triggerShake();
            return false;
        }
    };

    const handleForgotPassword = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await forgotPassword({ email });
            Alert.alert(
                "Email enviado",
                "Verifique sua caixa de entrada e siga as instruções para recuperar sua senha.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            let errorMessage = "Não foi possível enviar o email. Tente novamente.";

            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = "Email não encontrado em nossos registros.";
                } else if (error.response.status === 400) {
                    errorMessage = "Email inválido.";
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message === "Network Error") {
                errorMessage = "Erro de conexão. Verifique sua internet.";
            }

            triggerShake();
            setTimeout(() => {
                Alert.alert("Erro", errorMessage, [{ text: "OK" }]);
            }, 250);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }}
                    >
                        <View style={styles.logoContainer}>
                            <Image source={Logo} style={styles.logo} resizeMode="contain" />
                            <Text style={styles.appName}>Smart Marketing</Text>
                            <Text style={styles.subtitle}>Recuperar senha</Text>
                        </View>

                        <Animated.View
                            style={[
                                styles.formContainer,
                                { transform: [{ translateX: shakeAnim }] }
                            ]}
                        >
                            <TextInput
                                label="Email"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (errors.email) {
                                        setErrors({ ...errors, email: undefined });
                                    }
                                }}
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                outlineColor="#e0e0e0"
                                activeOutlineColor="#2E7D32"
                                error={!!errors.email}
                                disabled={loading}
                                left={<TextInput.Icon icon={() => <Ionicons name="mail-outline" size={20} color="#666" />} />}
                            />
                            {errors.email && (
                                <Text style={styles.errorText}>{errors.email}</Text>
                            )}

                            <Button
                                mode="contained"
                                onPress={handleForgotPassword}
                                style={styles.forgotButton}
                                labelStyle={styles.forgotButtonLabel}
                                disabled={loading}
                                loading={loading}
                                icon={!loading ? () => <Ionicons name="key-outline" size={20} color="white" /> : undefined}
                            >
                                {loading ? "Enviando..." : "Enviar email de recuperação"}
                            </Button>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>ou</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>Lembrou sua senha? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.loginLink}>Entrar</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
    },
    appName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
    formContainer: {
        width: "100%",
    },
    input: {
        marginBottom: 4,
        backgroundColor: "white",
    },
    errorText: {
        color: "#d32f2f",
        fontSize: 12,
        marginBottom: 12,
        marginLeft: 12,
    },
    forgotButton: {
        backgroundColor: "#2E7D32",
        paddingVertical: 8,
        borderRadius: 12,
        marginTop: 8,
        shadowColor: "#2E7D32",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    forgotButtonLabel: {
        fontSize: 16,
        fontWeight: "bold",
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e0e0e0",
    },
    dividerText: {
        marginHorizontal: 16,
        color: "#999",
        fontSize: 14,
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    loginText: {
        color: "#666",
        fontSize: 14,
    },
    loginLink: {
        color: "#2E7D32",
        fontSize: 14,
        fontWeight: "bold",
    },
});