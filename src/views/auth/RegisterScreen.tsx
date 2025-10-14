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
import { TextInput, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Logo from "../../assets/logo1.jpg";
import { RegisterDTO } from "../../dtos/authDTO";
import { register } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import { HomeStackParamList } from "../../../App";

type RegisterScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Register'>;

export default function RegisterScreen() {
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const { login: authLogin } = useAuth();
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
            await authLogin(response.user, response.token);
            navigation.goBack();
        } catch (error: any) {
            let errorMessage = "Não foi possível criar sua conta. Tente novamente.";
            
            if (error.response) {
                if (error.response.status === 409) {
                    errorMessage = "Este email já está cadastrado.";
                } else if (error.response.status === 400) {
                    errorMessage = "Dados inválidos. Verifique os campos.";
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message === "Network Error") {
                errorMessage = "Erro de conexão. Verifique sua internet.";
            }
            
            triggerShake();
            setTimeout(() => {
                Alert.alert("Erro ao criar conta", errorMessage, [{ text: "OK" }]);
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
                            <Text style={styles.subtitle}>Crie sua conta</Text>
                        </View>

                        <Animated.View 
                            style={[
                                styles.formContainer,
                                { transform: [{ translateX: shakeAnim }] }
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
                            outlineColor="#e0e0e0"
                            activeOutlineColor="#FF4500"
                            error={!!errors.name}
                            disabled={loading}
                            left={<TextInput.Icon icon={() => <Ionicons name="person-outline" size={20} color="#666" />} />}
                        />
                        {errors.name && (
                            <Text style={styles.errorText}>{errors.name}</Text>
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
                            outlineColor="#e0e0e0"
                            activeOutlineColor="#FF4500"
                            error={!!errors.confirmPassword}
                            disabled={loading}
                            left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} color="#666" />} />}
                            right={
                                <TextInput.Icon 
                                    icon={() => <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={loading}
                                />
                            }
                        />
                        {errors.confirmPassword && (
                            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                        )}

                        <Button
                            mode="contained"
                            onPress={handleRegister}
                            style={styles.registerButton}
                            labelStyle={styles.registerButtonLabel}
                            disabled={loading}
                            loading={loading}
                            icon={!loading ? () => <Ionicons name="person-add-outline" size={20} color="white" /> : undefined}
                        >
                            {loading ? "Criando conta..." : "Criar conta"}
                        </Button>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>ou</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Já tem uma conta? </Text>
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
    registerButton: {
        backgroundColor: "#FF4500",
        paddingVertical: 8,
        borderRadius: 12,
        marginTop: 8,
        shadowColor: "#FF4500",
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
        color: "#FF4500",
        fontSize: 14,
        fontWeight: "bold",
    },
});


