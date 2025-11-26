<script lang="ts">
  import { onMount } from "svelte";
  import { WORDS } from "$lib/data/readingWords";
  import WordLetters from "$lib/components/WordLetters.svelte";
  import RewardImage from "$lib/components/RewardImage.svelte";
  import type { GameWord } from "$lib/types/game";

  let currentIndex = 0;
  let recognizedText = "";
  let isListening = false;
  let status: "idle" | "correct" | "wrong" = "idle";
  let score = 0;

  let supportsSpeech = false;
  let correctLetterCount = 0;
  let showImage = false;
  let recognition: any = null;
  let autoRestartRecognition = false;

  const getCurrentWord = (): GameWord => WORDS[currentIndex];
  const isFinished = () => currentIndex >= WORDS.length;

  onMount(() => {
    const w = window as any;
    if (w.SpeechRecognition || w.webkitSpeechRecognition) {
      supportsSpeech = true;
    }
  });

  function normalize(text: string) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function computeCorrectPrefixLength(spoken: string, target: string) {
    const s = normalize(spoken).replace(/\s+/g, "");
    const t = normalize(target).replace(/\s+/g, "");
    let count = 0;

    for (let i = 0; i < t.length && i < s.length; i++) {
      if (s[i] === t[i]) count++;
      else break;
    }
    return count;
  }

  function checkAnswer(spoken: string) {
    const targetNorm = normalize(getCurrentWord().text);
    const spokenNorm = normalize(spoken);

    correctLetterCount = computeCorrectPrefixLength(spoken, getCurrentWord().text);

    const fullyCorrect =
      spokenNorm.includes(targetNorm) ||
      correctLetterCount >= targetNorm.replace(/\s+/g, "").length;

    if (fullyCorrect) {
      status = "correct";
      score++;

      showImage = true;
      correctLetterCount = targetNorm.length;

      // Stop recognition when answer is correct
      if (recognition) {
        autoRestartRecognition = false;
        recognition.stop();
      }

      // Give kids more time to see the reward image (4 seconds instead of 1.5)
      setTimeout(() => {
        showImage = false;
        status = "idle";
        recognizedText = "";
        correctLetterCount = 0;
        currentIndex++;
      }, 4000);
    } else {
      status = "wrong";
    }
  }

  function startListening() {
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

    recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = true;
    recognition.continuous = false; // Will auto-restart on end if needed
    recognition.maxAlternatives = 3; // Get more alternatives for better accuracy
    
    // Enable auto-restart so kids have unlimited time to speak
    autoRestartRecognition = true;

    isListening = true;
    status = "idle";
    recognizedText = "";
    correctLetterCount = 0;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          finalTranscript += r[0].transcript;
        } else {
          interimTranscript += r[0].transcript;
        }
      }
      
      // Show interim results to give kids feedback
      if (interimTranscript) {
        recognizedText = interimTranscript;
        correctLetterCount = computeCorrectPrefixLength(interimTranscript, getCurrentWord().text);
      }
      
      // Check final result
      if (finalTranscript) {
        recognizedText = finalTranscript;
        checkAnswer(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // These are common errors, just restart
        if (autoRestartRecognition && status !== "correct") {
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
      
      // Auto-restart if the kid hasn't gotten the answer correct yet
      // This gives them unlimited time to keep trying
      if (autoRestartRecognition && status !== "correct") {
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
    currentIndex = 0;
    score = 0;
    recognizedText = "";
    status = "idle";
    correctLetterCount = 0;
    showImage = false;
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-sky-100 p-4">

  {#if isFinished()}
    <div class="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
      <h1 class="text-3xl font-bold mb-4">Selesai! 🎉</h1>
      <p class="text-xl mb-4">Skor kamu: <span class="font-bold">{score}</span> / {WORDS.length}</p>
      <button on:click={resetGame}
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold">
        Main lagi
      </button>
    </div>
  {:else}

    <div class="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
      
      <p class="text-sm text-gray-500 mb-2">Soal {currentIndex + 1} dari {WORDS.length}</p>

      <p class="text-gray-600 mb-2">Baca kata / kalimat ini:</p>

      <WordLetters text={getCurrentWord().text} {correctLetterCount} />

      <!-- <div class="text-5xl mb-4">{getCurrentWord().hintEmoji}</div> -->

      {#if !isListening}
        <button
          class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full text-lg font-semibold mb-4"
          on:click={startListening}
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
            on:click={stopListening}
          >
            Berhenti
          </button>
        </div>
      {/if}

      <div class="text-left mb-3">
        <p class="text-sm font-medium text-gray-600">Yang terdengar:</p>
        <div class="border p-2 rounded-lg bg-gray-50 min-h-[40px]">
          {recognizedText || "—"}
        </div>
      </div>

      {#if status === "correct"}
        <p class="text-green-600 font-semibold text-lg">Benar! Hebat! 🎉</p>
      {:else if status === "wrong"}
        <p class="text-red-500 font-semibold text-lg">Belum tepat, coba lagi 😄</p>
      {/if}

      <RewardImage show={showImage} src={getCurrentWord().imageSrc} alt={getCurrentWord().text} />

    </div>
  {/if}

</div>
