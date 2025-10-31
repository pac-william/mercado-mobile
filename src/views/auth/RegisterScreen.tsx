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
import { TextInput, Button, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Logo from "../../assets/logo1.jpg";
import { RegisterDTO } from "../../dtos/authDTO";
import { register, loginWithGoogle } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import { HomeStackParamList } from "../../../App";
import { isNetworkError } from "../../utils/networkUtils";

type RegisterScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Register'>;

export default function RegisterScreen() {
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const { login: authLogin } = useAuth();
    const paperTheme = useTheme();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ 
        name?: string; 
        email?: string; 
        password?: string;
        confirmPassword?: string;
    }>({});
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

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
            RegisterDTO.parse({ name, email, password, confirmPassword });
            setErrors({});
            return true;
        } catch (error: any) {
            const fieldErrors: { 
                name?: string; 
                email?: string; 
                password?: string;
                confirmPassword?: string;
            } = {};
            
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

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await register({ name, email, password });
            await authLogin(response.user, response.token, response.idToken);
            navigation.goBack();
        } catch (error: any) {
            let errorMessage = "Não foi possível criar sua conta. Tente novamente.";
            
            if (error.name === "EmailAlreadyExists") {
                errorMessage = error.message;
            } else if (error.response) {
                if (error.response.status === 409) {
                    errorMessage = "Este email já está cadastrado.";
                } else if (error.response.status === 500) {
                    errorMessage = "Este email já está cadastrado.";
                } else if (error.response.status === 400) {
                    errorMessage = "Dados inválidos. Verifique os campos.";
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (isNetworkError(error)) {
                // Não mostra alert para erro de rede
                console.warn("Erro de conexão: Sem internet", error);
                triggerShake();
                setTimeout(() => {
                    Alert.alert(
                        "Sem conexão", 
                        "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente. Alguns recursos podem estar disponíveis offline.",
                        [{ text: "OK" }]
                    );
                }, 250);
                return;
            }
            
            triggerShake();
            setTimeout(() => {
                Alert.alert("Erro ao criar conta", errorMessage, [{ text: "OK" }]);
            }, 250);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);

        try {
            const response = await loginWithGoogle();
            await authLogin(response.user, response.token, response.idToken);
            navigation.goBack();
        } catch (error: any) {
            let errorMessage = "Não foi possível fazer login com Google.";

            if (error.name === "UserCancelled") {
                return;
            }

            if (error.response) {
                if (error.response.status === 409) {
                    errorMessage = "Este email já está cadastrado com outro método de login.";
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (isNetworkError(error)) {
                console.warn("Erro de conexão: Sem internet", error);
                Alert.alert(
                    "Sem conexão", 
                    "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente. Alguns recursos podem estar disponíveis offline.",
                    [{ text: "OK" }]
                );
                return;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert("Erro ao fazer login", errorMessage, [{ text: "OK" }]);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
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
                            <Text style={[styles.appName, { color: paperTheme.colors.onBackground }]}>
                                Smart Marketing
                            </Text>
                            <Text style={[styles.subtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
                                Crie sua conta
                            </Text>
                        </View>

                        <Animated.View 
                            style={[
                                styles.formContainer,
                                { 
                                    transform: [{ translateX: shakeAnim }],
                                    backgroundColor: paperTheme.colors.surface,
                                    borderRadius: 16,
                                    padding: 24,
                                }
                            ]}
                        >
                        <TextInput
                            label="Nome completo"
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (errors.name) {
                                    setErrors({ ...errors, name: undefined });
                                }
                            }}
                            mode="outlined"
                            autoCapitalize="words"
                            style={styles.input}
                            outlineColor={paperTheme.colors.outline}
                            activeOutlineColor={paperTheme.colors.primary}
                            error={!!errors.name}
                            disabled={loading || googleLoading}
                            left={<TextInput.Icon icon={() => <Ionicons name="person-outline" size={20} color={paperTheme.colors.onSurfaceVariant} />} />}
                        />
                        {errors.name && (
                            <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
                                {errors.name}
                            </Text>
                        )}

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
                            outlineColor={paperTheme.colors.outline}
                            activeOutlineColor={paperTheme.colors.primary}
                            error={!!errors.email}
                            disabled={loading || googleLoading}
                            left={<TextInput.Icon icon={() => <Ionicons name="mail-outline" size={20} color={paperTheme.colors.onSurfaceVariant} />} />}
                        />
                        {errors.email && (
                            <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
                                {errors.email}
                            </Text>
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
                            outlineColor={paperTheme.colors.outline}
                            activeOutlineColor={paperTheme.colors.primary}
                            error={!!errors.password}
                            disabled={loading || googleLoading}
                            left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} color={paperTheme.colors.onSurfaceVariant} />} />}
                            right={
                                <TextInput.Icon 
                                    icon={() => <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={paperTheme.colors.onSurfaceVariant} />}
                                    onPress={() => setShowPassword(!showPassword)}
                                    disabled={loading || googleLoading}
                                />
                            }
                        />
                        {errors.password && (
                            <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
                                {errors.password}
                            </Text>
                        )}

                        <TextInput
                            label="Confirmar senha"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) {
                                    setErrors({ ...errors, confirmPassword: undefined });
                                }
                            }}
                            mode="outlined"
                            secureTextEntry={!showConfirmPassword}
                            style={styles.input}
                            outlineColor={paperTheme.colors.outline}
                            activeOutlineColor={paperTheme.colors.primary}
                            error={!!errors.confirmPassword}
                            disabled={loading || googleLoading}
                            left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} color={paperTheme.colors.onSurfaceVariant} />} />}
                            right={
                                <TextInput.Icon 
                                    icon={() => <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={paperTheme.colors.onSurfaceVariant} />}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={loading || googleLoading}
                                />
                            }
                        />
                        {errors.confirmPassword && (
                            <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
                                {errors.confirmPassword}
                            </Text>
                        )}

                        <Button
                            mode="contained"
                            onPress={handleRegister}
                            style={styles.registerButton}
                            labelStyle={styles.registerButtonLabel}
                            disabled={loading || googleLoading}
                            loading={loading}
                            icon={!loading ? () => <Ionicons name="person-add-outline" size={20} color="white" /> : undefined}
                        >
                            {loading ? "Criando conta..." : "Criar conta"}
                        </Button>

                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: paperTheme.colors.outline }]} />
                            <Text style={[styles.dividerText, { color: paperTheme.colors.onSurfaceVariant }]}>ou</Text>
                            <View style={[styles.dividerLine, { backgroundColor: paperTheme.colors.outline }]} />
                        </View>

                        <Button
                            mode="outlined"
                            onPress={handleGoogleLogin}
                            style={styles.googleButton}
                            labelStyle={styles.googleButtonLabel}
                            disabled={loading || googleLoading}
                            loading={googleLoading}
                            icon={!googleLoading ? () => <Ionicons name="logo-google" size={20} color="#4285F4" /> : undefined}
                        >
                            {googleLoading ? "Conectando..." : "Entrar com Google"}
                        </Button>

                        <View style={styles.loginContainer}>
                            <Text style={[styles.loginText, { color: paperTheme.colors.onSurfaceVariant }]}>
                                Já tem uma conta?{" "}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={[styles.loginLink, { color: paperTheme.colors.primary }]}>
                                    Entrar
                                </Text>
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
        // backgroundColor será aplicado dinamicamente via props
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
        // color será aplicado dinamicamente via props
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 16,
        // color será aplicado dinamicamente via props
    },
    formContainer: {
        width: "100%",
        // backgroundColor será aplicado dinamicamente via props
    },
    input: {
        marginBottom: 4,
        // backgroundColor será aplicado dinamicamente via props do Paper
    },
    errorText: {
        // color será aplicado dinamicamente via props
        fontSize: 12,
        marginBottom: 12,
        marginLeft: 12,
    },
    registerButton: {
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
    registerButtonLabel: {
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
        // backgroundColor será aplicado dinamicamente via props
    },
    dividerText: {
        marginHorizontal: 16,
        // color será aplicado dinamicamente via props
        fontSize: 14,
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    loginText: {
        // color será aplicado dinamicamente via props
        fontSize: 14,
    },
    loginLink: {
        // color será aplicado dinamicamente via props
        fontSize: 14,
        fontWeight: "bold",
    },
    googleButton: {
        borderColor: "#4285F4",
        borderWidth: 1.5,
        paddingVertical: 8,
        borderRadius: 12,
        marginBottom: 24,
        backgroundColor: "white",
    },
    googleButtonLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#4285F4",
    },
});


