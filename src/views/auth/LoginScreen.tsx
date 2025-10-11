import React, { useState } from "react";
import { 
    View, 
    Text, 
    SafeAreaView, 
    StyleSheet, 
    Image,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import Logo from "../../assets/logo1.jpg";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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
                    <View style={styles.logoContainer}>
                        <Image source={Logo} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.appName}>Smart Marketing</Text>
                        <Text style={styles.subtitle}>Bem-vindo de volta</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            mode="outlined"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.input}
                            outlineColor="#e0e0e0"
                            activeOutlineColor="#FF4500"
                            left={<TextInput.Icon icon={() => <Ionicons name="mail-outline" size={20} color="#666" />} />}
                        />

                        <TextInput
                            label="Senha"
                            value={password}
                            onChangeText={setPassword}
                            mode="outlined"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            outlineColor="#e0e0e0"
                            activeOutlineColor="#FF4500"
                            left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} color="#666" />} />}
                            right={
                                <TextInput.Icon 
                                    icon={() => <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />

                        <TouchableOpacity style={styles.forgotPasswordContainer}>
                            <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
                        </TouchableOpacity>

                        <Button
                            mode="contained"
                            style={styles.loginButton}
                            labelStyle={styles.loginButtonLabel}
                            icon={() => <Ionicons name="log-in-outline" size={20} color="white" />}
                        >
                            Entrar
                        </Button>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>ou</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Não tem uma conta? </Text>
                            <TouchableOpacity>
                                <Text style={styles.registerLink}>Cadastre-se</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
        marginBottom: 16,
        backgroundColor: "white",
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

