package com.example.beaconuwb

import android.Manifest
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.estimote.uwb.api.EstimoteUWBFactory
import com.estimote.uwb.api.ranging.EstimoteUWBRangingResult
import com.estimote.uwb.api.scanning.EstimoteUWBScanResult
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val uwbManager by lazy { EstimoteUWBFactory.create() }

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions.values.all { it }
        if (granted) {
            Log.d("UWB", "Permisos concedidos, iniciando escaneo")
            uwbManager.startDeviceScanning(this)
        } else {
            Log.e("UWB", "Faltan permisos: $permissions")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        permissionLauncher.launch(
            arrayOf(
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.UWB_RANGING
            )
        )

        setContent {
            MaterialTheme {
                UwbRangingScreen()
            }
        }
    }

    @Composable
    fun UwbRangingScreen() {
        val scope = rememberCoroutineScope()

        var distance by remember { mutableStateOf<Double?>(null) }
        var azimuth by remember { mutableStateOf<Double?>(null) }
        var elevation by remember { mutableStateOf<Double?>(null) }
        var statusText by remember { mutableStateOf("Esperando conexión...") }
        var connected by remember { mutableStateOf(false) }

        LaunchedEffect(Unit) {
            scope.launch {
                uwbManager.uwbDevices
                    .catch { e ->
                        Log.e("UWB", "Error en escaneo: ${e.message}")
                        statusText = "Error en escaneo"
                    }
                    .collect { scan ->
                        Log.d("UWB", "Resultado del escaneo: $scan")
                        if (!connected && scan is EstimoteUWBScanResult.Devices && scan.devices.isNotEmpty()) {
                            val device = scan.devices.first().device
                            if (device != null) {
                                try {
                                    connected = true
                                    statusText = "Conectando..."
                                    Log.d("UWB", "Conectando con dispositivo: $device")
                                    uwbManager.connect(device, this@MainActivity)
                                    statusText = "Conectado y midiendo..."
                                } catch (ex: Exception) {
                                    Log.e("UWB", "Error al conectar: ${ex.message}")
                                    statusText = "Error al conectar: ${ex.message}"
                                }
                            }
                        }
                    }
            }

            scope.launch {
                uwbManager.rangingResult
                    .catch { e ->
                        Log.e("UWB", "Error en ranging: ${e.message}")
                        statusText = "Error en ranging"
                    }
                    .collect { result ->
                        if (result is EstimoteUWBRangingResult.Position) {
                            distance = result.position.distance?.value?.toDouble()
                            azimuth = result.position.azimuth?.value?.toDouble()
                            elevation = result.position.elevation?.value?.toDouble()
                            Log.d("UWB", "Distancia: $distance, Azimuth: $azimuth, Elevación: $elevation")
                        }
                    }
            }
        }

        Scaffold(
            modifier = Modifier.fillMaxSize()
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(32.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Estado: $statusText")
                Spacer(modifier = Modifier.height(24.dp))
                Text("📡 Distancia: ${distance?.format(2) ?: "--"} m")
                Text("Azimuth: ${azimuth?.format(1) ?: "--"}°")
                Text("Elevación: ${elevation?.format(1) ?: "--"}°")
            }
        }
    }

    private fun Double.format(decimals: Int): String =
        "%.${decimals}f".format(this)
}
