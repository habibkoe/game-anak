<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { storage } from '$lib/services/storage';
  import WordLetters from '$lib/components/WordLetters.svelte';
  import RewardImage from '$lib/components/RewardImage.svelte';
  import type { GameWord, Group } from '$lib/types/game';

  let groupId = $state<string>('');
  let group = $state<Group | undefined>(undefined);
  let words = $state<GameWord[]>([]);
  let currentIndex = $state(0);
  let recognizedText = $state('');
  let isListening = $state(false);
  let status = $state<'idle' | 'correct' | 'wrong'>('idle');
  let score = $state(0);
  let supportsSpeech = $state(false);
  let correctLetterCount = $state(0);
  let showImage = $state(false);
  let recognition: any = null;
  let autoRestartRecognition = $state(false);
  let showFinalReward = $state(false);
  let textSize = $state('text-4xl'); // Default text size

  function getCategoryIcon(): string {
    if (!group) return '📦';
    const categories = storage.getCategories();
    const category = categories.find(c => c.id === group?.categoryId);
    return category?.icon || '📦';
  }

  onMount(() => {
    storage.initializeDefaultData();
    
    // Get group ID from URL
    const params = new URLSearchParams(window.location.search);
    groupId = params.get('group') || '';
    
    if (!groupId) {
      goto('/select');
      return;
    }

    // Load group and words
    group = storage.getGroup(groupId);
    if (!group) {
      goto('/select');
      return;
    }

    words = storage.getWordsByGroup(groupId);
    if (words.length === 0) {
      goto('/select');
      return;
    }

    // Check speech support
    const w = window as any;
    if (w.SpeechRecognition || w.webkitSpeechRecognition) {
      supportsSpeech = true;
    }
  });

  const getCurrentWord = (): GameWord | undefined => words[currentIndex];
  const isFinished = () => currentIndex >= words.length;

  function normalize(text: string) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function computeCorrectPrefixLength(spoken: string, target: string) {
    const s = normalize(spoken).replace(/\s+/g, '');
    const t = normalize(target).replace(/\s+/g, '');
    let count = 0;

    for (let i = 0; i < t.length && i < s.length; i++) {
      if (s[i] === t[i]) count++;
      else break;
    }
    return count;
  }

  function checkAnswer(spoken: string) {
    const currentWord = getCurrentWord();
    if (!currentWord) return;

    const targetNorm = normalize(currentWord.text);
    const spokenNorm = normalize(spoken);

    correctLetterCount = computeCorrectPrefixLength(spoken, currentWord.text);

    const fullyCorrect =
      spokenNorm.includes(targetNorm) ||
      correctLetterCount >= targetNorm.replace(/\s+/g, '').length;

    if (fullyCorrect) {
      status = 'correct';
      score++;
      showImage = true;
      correctLetterCount = targetNorm.length;

      // Stop recognition
      if (recognition) {
        autoRestartRecognition = false;
        recognition.stop();
      }

      // Move to next word or show final reward
      setTimeout(() => {
        showImage = false;
        status = 'idle';
        recognizedText = '';
        correctLetterCount = 0;
        currentIndex++;

        // Check if game is finished
        if (isFinished()) {
          showFinalReward = true;
        }
      }, 4000);
    } else {
      status = 'wrong';
    }
  }

  function startListening() {
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

    recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 3;

    autoRestartRecognition = true;
    isListening = true;
    status = 'idle';
    recognizedText = '';
    correctLetterCount = 0;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          finalTranscript += r[0].transcript;
        } else {
          interimTranscript += r[0].transcript;
        }
      }

      if (interimTranscript) {
        recognizedText = interimTranscript;
        const currentWord = getCurrentWord();
        if (currentWord) {
          correctLetterCount = computeCorrectPrefixLength(interimTranscript, currentWord.text);
        }
      }

      if (finalTranscript) {
        recognizedText = finalTranscript;
        checkAnswer(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        if (autoRestartRecognition && status !== 'correct') {
          setTimeout(() => {
            if (autoRestartRecognition) {
              recognition.start();
            }
          }, 100);
        }
      }
    };

    recognition.onend = () => {
      isListening = false;

      if (autoRestartRecognition && status !== 'correct') {
        setTimeout(() => {
          if (autoRestartRecognition) {
            isListening = true;
            recognition.start();
          }
        }, 300);
      }
    };

    recognition.start();
  }

  function stopListening() {
    autoRestartRecognition = false;
    if (recognition) {
      recognition.stop();
    }
    isListening = false;
  }

  function resetGame() {
    showFinalReward = false;
    currentIndex = 0;
    score = 0;
    recognizedText = '';
    status = 'idle';
    correctLetterCount = 0;
    showImage = false;
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-4">
  {#if showFinalReward && group}
    <!-- Final Reward Screen -->
    <div class="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-2xl w-full border-4 border-yellow-400">
      <div class="text-6xl mb-4">🎉</div>
      <h1 class="text-3xl font-bold mb-4 text-gray-800">Selamat!</h1>
      <p class="text-xl mb-4 text-gray-700">
        Kamu telah menyelesaikan semua kata!
      </p>
      <p class="text-lg mb-2 text-gray-600">Skor kamu: <span class="font-bold text-green-600">{score}</span> / {words.length}</p>
      
      <!-- Final Reward -->
      <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-4 border-yellow-400 rounded-2xl p-6 mb-6">
        <p class="text-lg font-bold text-yellow-900 mb-3">🎁 REWARD KAMU:</p>
        <p class="text-3xl font-bold text-yellow-800 mb-4">{group.finalRewardText}</p>
        {#if group.finalRewardImage}
          <img 
            src={group.finalRewardImage} 
            alt={group.finalRewardText}
            class="w-full max-w-sm mx-auto rounded-lg shadow-lg"
          />
        {/if}
      </div>

      <div class="flex gap-3">
        <button onclick={resetGame} class="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold">
          Main Lagi
        </button>
        <a href="/select" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold inline-flex items-center justify-center">
          Pilih Grup Lain
        </a>
      </div>
    </div>
  {:else if words.length > 0 && !isFinished()}
    <!-- Game Screen -->
    <div class="bg-white p-8 rounded-3xl shadow-2xl max-w-4xl w-full border-4 border-blue-300">
      <!-- Header with Progress -->
      <div class="mb-6 flex items-center justify-between">
        <div class="text-left">
          <p class="text-lg font-bold text-blue-600">Soal {currentIndex + 1} dari {words.length}</p>
          {#if group}
            <p class="text-sm text-gray-500">{getCategoryIcon()} {group.name}</p>
          {/if}
        </div>
        
        <!-- Text Size Controls -->
        <div class="flex items-center gap-2 bg-gray-100 rounded-full p-2">
          <button
            onclick={() => textSize = 'text-2xl'}
            class="px-3 py-1 rounded-full font-bold {textSize === 'text-2xl' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}"
          >
            A
          </button>
          <button
            onclick={() => textSize = 'text-4xl'}
            class="px-3 py-1 rounded-full font-bold text-lg {textSize === 'text-4xl' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}"
          >
            A
          </button>
          <button
            onclick={() => textSize = 'text-6xl'}
            class="px-3 py-1 rounded-full font-bold text-xl {textSize === 'text-6xl' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}"
          >
            A
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="bg-gray-200 rounded-full h-3">
          <div 
            class="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
            style="width: {((currentIndex) / words.length) * 100}%"
          ></div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
        <p class="text-xl font-bold text-blue-800 mb-4">📖 Baca kata / kalimat ini:</p>

        {#if getCurrentWord()}
          <div class="{textSize} font-bold text-center mb-4">
            <WordLetters text={getCurrentWord()!.text} {correctLetterCount} />
          </div>
        {/if}
      </div>

      {#if !isListening}
        <button
          class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full text-lg font-semibold mb-4"
          onclick={startListening}
        >
          Mulai Bicara 🎤
        </button>
      {:else}
        <div class="flex gap-2 mb-4">
          <div class="flex-1 bg-blue-500 text-white py-3 rounded-full text-lg font-semibold flex items-center justify-center">
            <span class="animate-pulse">🎤 Mendengarkan...</span>
          </div>
          <button
            class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full text-lg font-semibold"
            onclick={stopListening}
          >
            Berhenti
          </button>
        </div>
      {/if}

      <div class="text-left mb-3">
        <p class="text-sm font-medium text-gray-600">Yang terdengar:</p>
        <div class="border p-2 rounded-lg bg-gray-50 min-h-[40px]">
          {recognizedText || '—'}
        </div>
      </div>

      {#if status === 'correct'}
        <p class="text-green-600 font-semibold text-lg">Benar! Hebat! 🎉</p>
      {:else if status === 'wrong'}
        <p class="text-red-500 font-semibold text-lg">Belum tepat, coba lagi 😄</p>
      {/if}

      {#if getCurrentWord()}
        <RewardImage show={showImage} src={getCurrentWord()!.imageSrc} alt={getCurrentWord()!.text} />
      {/if}

      <div class="mt-4 pt-4 border-t">
        <a href="/select" class="text-gray-500 hover:text-gray-700 text-sm">
          ← Kembali ke pilihan
        </a>
      </div>
    </div>
  {/if}
</div>
