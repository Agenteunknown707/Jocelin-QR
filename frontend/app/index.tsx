import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [savedCodes, setSavedCodes] = useState([]);
  const [facing, setFacing] = useState<CameraType>('back');
  
  // Cambia esta URL para que apunte a tu servidor backend
  const API_URL = 'http://192.168.1.5:3000'; // Reemplaza con tu IP local

  useEffect(() => {
    fetchSavedCodes();
  }, []);

  const fetchSavedCodes = async () => {
    try {
      const response = await fetch(`${API_URL}/codigos`);
      const data = await response.json();
      setSavedCodes(data);
    } catch (error) {
      console.error('Error al obtener códigos:', error);
    }
  };

  const handleBarCodeScanned = async (scanningResult) => {
    if (scanned) return;
    
    const { type, data } = scanningResult;
    setScanned(true);
    
    const qrData = {
      id: Date.now().toString(16), // Generar un ID único basado en timestamp
      data: data,
      type: "qr"
    };
    
    setScannedData(qrData);
    
    // Generar un ID único basado en timestamp
    const id = Date.now().toString(16);
    
    try {
      const response = await fetch(`${API_URL}/codigos`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json;encoding=utf-8',
          'Content-Type': 'application/json;encoding=utf-8',
        },
        body: JSON.stringify({
          id: id,
          data: data,
          type: "qr"
        })
      });
      
      if (response.ok) {
        fetchSavedCodes(); // Actualizar la lista después de guardar
      }
    } catch (error) {
      console.error('Error al guardar el código:', error);
    }
  };

  const deleteCode = async (id) => {
    try {
      const response = await fetch(`${API_URL}/codigos/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json;encoding=utf-8',
          'Content-Type': 'application/json;encoding=utf-8',
        }
      });
      
      if (response.ok) {
        fetchSavedCodes(); // Actualizar la lista después de eliminar
      }
    } catch (error) {
      console.error('Error al eliminar el código:', error);
    }
  };

  // Manejo de permisos con la nueva API
  if (!permission) {
    // Los permisos de la cámara aún se están cargando
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Cargando permisos de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Los permisos de la cámara no han sido concedidos aún
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Necesitamos tu permiso para usar la cámara</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.scannerContainer}>
        {!scanned ? (
          <CameraView
            style={styles.scanner}
            facing={facing}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={handleBarCodeScanned}
          >
            {/* Puedes agregar elementos UI dentro de CameraView */}
            <View style={styles.overlay}>
              <Text style={styles.scanText}>Escanea un código QR</Text>
            </View>
          </CameraView>
        ) : (
          <View style={styles.scannedOverlay}>
            <Text style={styles.scannedDataTitle}>Código escaneado:</Text>
            <Text style={styles.scannedDataText}>
              {scannedData ? JSON.stringify(scannedData, null, 2) : ''}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.buttonText}>Escanear de nuevo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.savedCodesContainer}>
        <Text style={styles.savedCodesTitle}>Códigos guardados</Text>
        {savedCodes.length === 0 ? (
          <Text style={styles.noCodesText}>No hay códigos guardados</Text>
        ) : (
          <FlatList
            data={savedCodes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.codeItem}>
                <Text style={styles.codeData} numberOfLines={1} ellipsizeMode="tail">
                  {item.data}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteCode(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Color morado principal
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  scannerContainer: {
    width: '80%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 20,
  },
  scanner: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    color: '#ffffff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  scannedOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: '#7c4dff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  scannedDataTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scannedDataText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3700b3', // Morado más oscuro
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  savedCodesContainer: {
    flex: 1,
    width: '90%',
    backgroundColor: '#7c4dff', // Morado más claro
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  savedCodesTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noCodesText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  codeItem: {
    backgroundColor: '#9d46ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeData: {
    color: '#ffffff',
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#3700b3',
    padding: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  messageText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    marginHorizontal: 20,
  },
});