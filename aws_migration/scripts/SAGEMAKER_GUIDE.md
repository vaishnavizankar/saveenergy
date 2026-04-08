# SageMaker Waste Predictor: Training & Fine-Tuning Guide

This guide details how to train and fine-tune the SageMaker `LinearLearner` model for the **SaveEnergy** platform as an AWS Native service.

## 1. Feature Engineering (Model Input)
To detect "Wastefully Idle" resources, the model is trained on a 2-dimensional feature vector:
- **`CPU_Utilization_Avg`**: The mean CPU usage over a 15-minute window.
- **`Hour_of_Day`**: To handle time-of-day variability (e.g., low usage at 3 AM is normal; low usage at 11 AM suggests an idle waste).

## 2. Hyperparameter Fine-Tuning (LinearLearner)

| Parameter | Value | Rationale |
| :--- | :--- | :--- |
| **`predictor_type`** | `binary_classifier` | Classifies resources as 'Waste/Idle' (1) or 'Efficient/Active' (0). |
| **`binary_classifier_model_selection_criteria`** | `f1` | Balancing precision and recall to avoid false positives (stopping active servers). |
| **`mini_batch_size`** | `100` | Optimal for local cloud metrics datasets. |
| **`feature_dim`** | `2` | Minimal input features for high-speed, cost-effective inference. |

## 3. Deployment Configuration (SageMaker Endpoint)

- **Instance Type**: `ml.t2.medium` (Optimized for sporadic, bursty inference requests).
- **Auto-Scaling**: Configured to scale up if Inference Latency > 100ms.

## 4. Retraining Loop (Self-Correcting)
Every time a user **Accepts** or **Rejects** a recommendation in the SaveEnergy Dashboard, the feedback is logged to **S3**. 
- A scheduled **EventBridge** trigger launches a new **SageMaker Training Job** monthly to refine the `Idle Waste` thresholds based on real user decisions.

---
**Model fine-tuning provided by Antigravity AI - AWS Data Engineering Specialist.**
