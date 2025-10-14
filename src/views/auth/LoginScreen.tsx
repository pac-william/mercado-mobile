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
import { LoginDTO } from "../../dtos/authDTO";
import { login } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import { HomeStackParamList } from "../../../App";

type LoginScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Login'>;

export default function LoginScreen() {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const { login: authLogin } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
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
            LoginDTO.parse({ email, password });
            setErrors({});
            return true;
        } catch (error: any) {
            const fieldErrors: { email?: string; password?: string } = {};
            
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

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await login({ email, password });
            await authLogin(response.user, response.token);
            navigation.goBack();
        } catch (error: any) {
            let errorMessage = "Não foi possível fazer login. Tente novamente.";
            
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = "Email ou senha incorretos.";
                } else if (error.response.status === 404) {
                    errorMessage = "Usuário não encontrado.";
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message === "Network Error") {
                errorMessage = "Erro de conexão. Verifique sua internet.";
            }
            
            triggerShake();
            setTimeout(() => {
                Alert.alert("Erro ao fazer login", errorMessage, [{ text: "OK" }]);
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
                            <Text style={styles.subtitle}>Bem-vindo de volta</Text>
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
                            activeOutlineColor="#FF4500"
                            error={!!errors.email}
                            disabled={loading}
                            left={<TextInput.Icon icon={() => <Ionicons name="mail-outline" size={20} color="#666" />} />}
                        />
                        {errors.email && (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        )}

                        <TextInput
                            label="Senha"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) {
                                    setErrors({ ...errors, password: undefined });
                                }
                            }}
                            mode="outlined"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            outlineColor="#e0e0e0"
                            activeOutlineColor="#FF4500"
                            error={!!errors.password}
                            disabled={loading}
                            left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} color="#666" />} />}
                            right={
                                <TextInput.Icon 
                                    icon={() => <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />}
                                    onPress={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                />
                            }
                        />
                        {errors.password && (
                            <Text style={styles.errorText}>{errors.password}</Text>
                        )}

                        <TouchableOpacity
                            style={styles.forgotPasswordContainer}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
                        </TouchableOpacity>

                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            style={styles.loginButton}
                            labelStyle={styles.loginButtonLabel}
                            disabled={loading}
                            loading={loading}
                            icon={!loading ? () => <Ionicons name="log-in-outline" size={20} color="white" /> : undefined}
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </Button>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>ou</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Não tem uma conta? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerLink}>Cadastre-se</Text>
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
        marginBottom: 48,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
    },
    appName: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 8,
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
    forgotPasswordContainer: {
        alignItems: "flex-end",
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: "#0891B2",
        fontSize: 14,
        fontWeight: "600",
    },
    loginButton: {
        backgroundColor: "#FF4500",
        paddingVertical: 8,
        borderRadius: 12,
        shadowColor: "#FF4500",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginButtonLabel: {
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
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    registerText: {
        color: "#666",
        fontSize: 14,
    },
    registerLink: {
        color: "#FF4500",
        fontSize: 14,
        fontWeight: "bold",
    },
});