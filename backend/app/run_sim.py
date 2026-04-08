from simulate import simulate_pulse
import sys

print("AWS Audit Pipeline Simulation starting...")

try:
    # Run for 2 iterations just for verification trace
    simulate_pulse()
except Exception as e:
    print(f"Simulation Status: {str(e)}")
