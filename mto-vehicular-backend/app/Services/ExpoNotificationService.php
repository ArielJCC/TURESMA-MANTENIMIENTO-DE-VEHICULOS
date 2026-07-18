<?php

namespace App\Services;

use App\Models\DeviceToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoNotificationService
{
    /**
     * Send a push notification to all registered devices.
     *
     * @param string $title
     * @param string $body
     * @param array $data
     * @return void
     */
    public static function sendToAll(string $title, string $body, array $data = [])
    {
        $tokens = DeviceToken::pluck('token')->toArray();

        if (empty($tokens)) {
            Log::info("No registered device tokens found for push notifications.");
            return;
        }

        $payload = [];
        foreach ($tokens as $token) {
            // Expo push tokens usually look like ExponentPushToken[...] or ExpoPushToken[...]
            if (str_contains($token, 'ExponentPushToken') || str_contains($token, 'ExpoPushToken')) {
                $payload[] = [
                    'to' => $token,
                    'sound' => 'default',
                    'title' => $title,
                    'body' => $body,
                    'data' => $data
                ];
            }
        }

        if (empty($payload)) {
            Log::info("No valid Expo push tokens found.");
            return;
        }

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post('https://exp.host/--/api/v2/push/send', $payload);

            if ($response->successful()) {
                Log::info("Expo Push Notifications sent successfully to " . count($payload) . " devices.");
            } else {
                Log::error("Expo Push Notification request failed: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Failed to send Expo Push Notification: " . $e->getMessage());
        }
    }
}
