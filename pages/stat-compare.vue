<template>
  <div class="min-h-screen flex items-start justify-center bg-gray-200">
    <div class="text-center mt-8">
      <h1 class="text-4xl font-bold text-blue-600 mb-4">Compare Stats</h1>
      <div class="flex justify-around mt-8 space-x-10"> <!-- Adjusted space-x value to 0 -->
        <div class="w-1/2">
          <div class="flex flex-col items-center mb-4">
            <div class="flex items-center w-full mb-4">
              <input
                v-model="user1"
                type="text"
                placeholder="Enter username"
                class="w-full p-2 border border-gray-300 rounded"
              />
              <button
                @click="fetchSkills(user1, 1)"
                class="w-full ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Fetch stats
              </button>
            </div>
            <div v-if="isError1 && !loading1" class="font-bold text-lg underline">
              Failed to fetch stats. Make sure username is correct.
            </div>
            <div v-if="loading1" class="loader"></div>
            <table v-if="skillsList1.length > 0 && !loading1" class="w-full border-collapse border border-gray-400">
              <thead>
                <tr>
                  <th class="thick-border border-gray-400 p-2">Skill</th>
                  <th class="thick-border border-gray-400 p-2">Rank</th>
                  <th class="thick-border border-gray-400 p-2">Level</th>
                  <th class="thick-border border-gray-400 p-2">Experience</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="skill in skillsList1" :key="skill.name">
                  <td class="thick-border border-gray-400 p-2 flex items-center min-w-32">
                    <img :src="images[`${skill.name}`]" alt="Skill Icon" class="w-6 h-6 mr-2" />
                    <span>{{ skill.name }}</span>
                  </td>
                  <td class="thick-border border-gray-400 p-2 min-w-20">{{ formatValue(skill.rank) }}</td>
                  <td class="thick-border border-gray-400 p-2 min-w-20">{{ skill.level }}</td>
                  <td class="thick-border border-gray-400 p-2 min-w-20">{{ formatValue(skill.xp) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="w-1/7 mt-11 flex flex-col items-center justify-center">
          <table v-if="skillsList1.length > 0 && skillsList2.length > 0 && !loading1 && !loading2">
            <thead>
              <tr>
                <th class="invisible-text p-2">Arrow</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(skill, index) in skillsList1" :key="index">
                <td class="no-border p-2 flex items-center justify-center">
                  <img
                    src="@/assets/images/arrow.png"
                    alt="Arrow Icon"
                    class="w-6 h-6"
                    :style="{ transform: `rotate(${getArrowRotation(index)}deg)` }"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="w-1/2">
          <div class="flex flex-col items-center mb-4">
            <div class="flex items-center w-full mb-4">
              <input
                v-model="user2"
                type="text"
                placeholder="Enter username"
                class="w-full p-2 border border-gray-300 rounded"
              />
              <button
                @click="fetchSkills(user2, 2)"
                class="w-full ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Fetch stats
              </button>
            </div>
            <div v-if="isError2 && !loading2" class="font-bold text-lg underline">
              Failed to fetch stats. Make sure username is correct.
            </div>
            <div v-if="loading2" class="loader"></div>
            <table v-if="skillsList2.length > 0 && !loading2" class="w-full border-collapse border border-gray-400">
              <thead>
                <tr>
                  <th class="thick-border border-gray-400 p-2">Skill</th>
                  <th class="thick-border border-gray-400 p-2">Rank</th>
                  <th class="thick-border border-gray-400 p-2">Level</th>
                  <th class="thick-border border-gray-400 p-2">Experience</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="skill in skillsList2" :key="skill.name">
                  <td class="thick-border border-gray-400 p-2 flex items-center min-w-32">
                    <img :src="images[`${skill.name}`]" alt="Skill Icon" class="w-6 h-6 mr-2" />
                    <span>{{ skill.name }}</span>
                  </td>
                  <td class="thick-border border-gray-400 p-2 min-w-20">{{ formatValue(skill.rank) }}</td>
                  <td class="thick-border border-gray-400 p-2 min-w-20">{{ skill.level }}</td>
                  <td class="thick-border border-gray-400 p-2 min-w-20">{{ formatValue(skill.xp) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { HiscoreResponse, Skill } from '~/types';
import { filename } from 'pathe/utils'

const glob = import.meta.glob('@/assets/images/skills/*.png', { eager: true })
const images = Object.fromEntries(
  Object.entries(glob).map(([key, value]) => [filename(key), (value as { default: string }).default])
)

const user1 = ref('');
const user2 = ref('');
const skillsList1 = ref<Skill[]>([]);
const skillsList2 = ref<Skill[]>([]);
const loading1 = ref(false);
const loading2 = ref(false);
const isError1 = ref(false);
const isError2 = ref(false);

const fetchSkills = async (username: string, number: number) => {
  if (number === 1) {
    loading1.value = true;
    isError1.value = false;
  } else {
    loading2.value = true;
    isError2.value = false;
  }
  try {
    //const response = await fetch(`http://localhost:3001/api/hiscore?username=${username}`, {
    const response = await fetch(`https://grindalf.azurewebsites.net/api/osrs?username=${username}`, {  
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    if (!response.ok) {
      if (number === 1) {
        isError1.value = true;
      } else {
        isError2.value = true;
      }
      throw new Error('Network response was not ok');
    }
    console.log('response', response);
    console.log('response.body()', response.body);
    const data: HiscoreResponse = await response.json();
    if (number === 1) {
      skillsList1.value = data.skills;
    } else {
      skillsList2.value = data.skills;
    }
  }
  catch (error) {
    console.error(error);
  }
  finally {
    loading1.value = false;
    loading2.value = false;
  }
};

const formatValue = (value: number) => {
  return value === -1 ? '-' : value.toLocaleString();
};

const getArrowRotation = (index: number) => {
  if (skillsList1.value[index] && skillsList2.value[index]) {
    const value1 = skillsList1.value[index].xp;
    const value2 = skillsList2.value[index].xp;
    return value1 > value2 ? 90 : -90;
  }
  return 0;
};

</script>

<style scoped>
.thick-border {
  border: 1px solid #353838; /* Adjust the thickness and color as needed */
}

.no-border {
  border: 1px solid transparent;
}

.min-w-20 {
  min-width: 6rem; /* Adjust the minimum width as needed */
}

.min-w-32 {
  min-width: 9rem; /* Adjust the minimum width as needed */
}

.mx-1 {
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}

.invisible-text {
  visibility: hidden;
}

.row-height {
  height: 3rem; /* Adjust the height to match the row height of the other tables */
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