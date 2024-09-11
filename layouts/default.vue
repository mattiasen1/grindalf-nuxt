<template>
    <div>
      <header>
        <h1 class="font-bold text-2xl">Old School Runescape tools by Grindalf</h1>
        <nav class="font-bold text-xl">
          <NuxtLink to="/">Home</NuxtLink>
          <NuxtLink to="/drycalc">Dry Calculator</NuxtLink>
        </nav>
      </header>
      <main>
        <NuxtPage />
      </main>
      <footer>
        <p>&copy; 2024 No copyright. No Bueno</p>
      </footer>
    </div>
</template>
  
<script setup>
  // No additional script needed for this simple example
</script>
  
<style scoped>
header, footer {
    background-color: rgba(161, 199, 238, 0.8); /* Slightly transparent to show gradient */
    padding: 1rem;
    text-align: center;
}

nav a {
    margin: 0 1rem;
    text-decoration: none;
    color: #007bff;
}

nav a:hover {
    text-decoration: underline;
}
</style>