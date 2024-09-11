<template>
    <div class="min-h-screen flex items-start justify-center bg-gray-200">
      <div class="text-center mt-8">
        <h1 class="text-4xl font-bold text-blue-600 mb-4">Dry Calculator</h1>
        <input
          type="text"
          placeholder="Enter your Username"
          class="mr-4 mt-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          v-model="username"
          required      
          />
        <select
          class="mr-4 mt-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          v-model="selectedBoss"
          @change="loadImage"
          required
          >
            <option value="" disabled selected>Select Boss</option>
            <option v-for="boss in bosses" :key="boss.value" :value="boss.value">{{ boss.text }}</option>
        </select>
        <select
          class="mr-4 mt-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          v-model="selectedItem"
          required
          >
            <option value=null disabled selected>Select item</option>
            <option v-for="item in bossList.find(boss => boss.value === selectedBoss)?.items" :key="item.name" :value="item">{{ item.name }}</option>
        </select>
        <input
          type="number"
          placeholder="Drops Recieved"
          class="mr-4 mt-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          v-model="dropsReceived" 
          required   
          />
        <button 
          class="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          @click="fetchKC"
          >
          Calculate Dryness
          </button>
          <div v-if="bossImage" class="image-container">
            <img :src="bossImage" :alt="selectedBoss" class="fixed-size-image"/>
            <div v-if="loading" class="loader"></div>
            <div v-if="killCount !== -1 && !loading" class="kill-count-text">
                You have killed {{ bossList.find(boss => boss.value == selectedBoss)?.text }} {{ killCount }} times!
            </div>
            <div v-if="probability !== null && !loading" class="probability-text">
                Probability of having received {{ dropsReceived }} {{ selectedItem?.name }} drop(s): {{ (probability * 100).toFixed(4) }}%
            </div>
            <!-- <div v-if="probability !== null && !loading" class="comment-text">
              {{ getComment(probability) }}
            </div> -->
            <div v-if="isError && !loading" class="comment-text">
                Failed to fetch kill count for {{ username }}. Make sure username is correct.
            </div>
      </div>
      </div>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue';
import { bosses } from '~/src/data/bosses.js';
import { comments } from '~/src/data/comments.js';
import type { Activity, HiscoreResponse, Item } from '~/types/index.js';

const bossList = ref(bosses);
const username = ref('');
const selectedBoss = ref('');
const selectedItem = ref<Item | null>(null);
const dropsReceived = ref<number | null>(null);
const bossImage = ref('');
const killCount = ref<number | null>(null);
const loading = ref(false);
const probability = ref<number | null>(null);
const isError = ref(false);

const loadImage = async () => {
  killCount.value = -1;
  selectedItem.value = null;
  if (selectedBoss.value) {
    try {
      const imageModule = await import(`~/assets/images/${selectedBoss.value}.png`);
      bossImage.value = imageModule.default;
    } catch (error) {
      console.error('Failed to load image for ', selectedBoss.value, '. Failed with error:', error);
      bossImage.value = ''; // Reset the image if loading fails
    }
  } else {
    bossImage.value = ''; // Reset the image if no boss is selected
  }
};

const fetchKC = async () => {
  if (!username.value || !selectedBoss.value || !selectedItem.value || dropsReceived.value === null) {
    alert('Please fill in all required fields.');
    return;
  }
  loading.value = true;
  try {
    const response = await fetch(`/api/m=hiscore_oldschool/index_lite.json?player=${username.value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    if (!response.ok) {
      isError.value = true;
      throw new Error('Network response was not ok');
    }
    const data: HiscoreResponse = await response.json();
    console.log('selected boss: ', selectedBoss.value);
    console.log(data.activities.find((activity: Activity) => activity.name === bosses.find(boss => boss.value === selectedBoss.value)?.text));
    const activity = data.activities.find((activity: Activity) => activity.name === bossList.value.find(boss => boss.value === selectedBoss.value)?.text);
    killCount.value = activity ? activity.score : -1;
    console.log(selectedItem.value)
    calculateProbability();
  } catch (error) {
    console.error('Failed to fetch KC for ', username.value, '. Failed with error:', error);
    isError.value = false;
  } finally {
    loading.value = false;
  }
};

const calculateProbability = () => {
  if (killCount.value !== null && dropsReceived.value !== null && selectedItem.value) {
    const dropRate = selectedItem.value.droprate;
    if (isNaN(dropRate) || dropRate <= 0) {
      console.error('Invalid drop rate:', selectedItem.value);
      return;
    }
    const p = dropRate;
    const n = killCount.value;
    const k = dropsReceived.value;

    probability.value = binomialProbability(n, k, p);
  } else {
    console.error('Invalid input values:', { killCount: killCount.value, dropsReceived: dropsReceived.value, selectedItem: selectedItem.value });
  }
};

const binomialProbability = (n: number, k: number, p: number): number => {
  const logBinomialCoefficient = logIterativeBinomialCoefficient(n, k);
  const logP = Math.log(p);
  const logOneMinusP = Math.log(1 - p);
  const logProbability = logBinomialCoefficient + k * logP + (n - k) * logOneMinusP;
  const probability = Math.exp(logProbability);
  return probability;
};

const logIterativeBinomialCoefficient = (n: number, k: number): number => {
  if (k > n) return -Infinity;
  if (k === 0 || k === n) return 0;
  k = Math.min(k, n - k); // Take advantage of symmetry
  let logC = 0;
  for (let i = 0; i < k; i++) {
    logC += Math.log(n - i) - Math.log(i + 1);
  }
  return logC;
};

// const getComment = (probability: number): string => {
//   const percentage = probability * 100;
//   const filteredComments = comments.filter(comment => percentage <= comment.threshold && percentage >= comment.threshold - 5);
//   console.log('filtered comments:', filteredComments);
//   if (filteredComments.length > 0) {
//     const randomIndex = Math.floor(Math.random() * filteredComments.length);
//     return filteredComments[randomIndex].comment;
//   }
//   return "No comment available for this probability.";
// };

</script>
  
<style scoped>
.fixed-size-image {
  width: 250; /* Set your desired width */
  height: 300px; /* Set your desired height */
  object-fit: fill; /* Ensure the image covers the area without distortion */
  padding: 1vh;
}

.image-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%; /* Adjust as needed */
}
.kill-count-text {
  margin-top: 10px;
  font-size: 25px;
  font-style: normal;
  color: #333;
}

.probability-text {
  margin-top: 10px;
  font-size: 18px;
  font-style: italic;
  color: #333;
}

.comment-text {
  margin-top: 40px;
  font-size: 20px;
  color: #333;
}

.loader {
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 120px;
  height: 120px;
  animation: spin 2s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>