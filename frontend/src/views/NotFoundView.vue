<template>
  <div
    class="bg-background-2 min-h-full px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8"
  >
    <div class="max-w-max mx-auto">
      <main class="sm:flex">
        <div class="sm:ml-6">
          <h1 class="text-4xl font-extrabold text-gray-400 tracking-tight sm:text-5xl">
            Page not found
          </h1>
          <p class="mt-1 text-base text-gray-500">
            Please check the URL in the address bar and try again.
          </p>
          <div class="mt-10 flex space-x-3">
            <RouterLink
              to="/"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go back home
            </RouterLink>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
