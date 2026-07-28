<script setup lang="ts">
  const emit = defineEmits<{
      (e: 'nextStep'): void;
  }>();
</script>

<template>
  <div class="flex w-7xl flex-col items-center text-gray-700 relative">
     <div class="sticky top-0 w-full! flex justify-start items-center bg-[#faf9f6] py-6">
      <h2 class="text-3xl font-bold! sticky top-0 bg-[#faf9f6]">Study Consent Form</h2>
     </div>

    <div
      class="w-full flex flex-col gap-4 leading-relaxed text-left"
    >

      <!-- Title -->
      <p class="text-xl font-semibold!">
        <span class="font-bold!">Title of Research Study:</span>
        Foraging and Sensemaking with AI Search
      </p>

      <!-- Investigator Contact -->
      <div>
        <p class="text-xl font-semibold!">Investigator Team Contact Information</p>
        <p>Harmanpreet Kaur</p>
        <p>
          For questions about research appointments, the research study,
          research results, or other concerns, call the study team at:
        </p>

        <div class="border border-gray-300 rounded p-3 mt-2">
          <div class="grid grid-cols-2 gap-2">
            <p class="font-semibold!">Phone Number:</p>
            <p>612-999-5411</p>

            <p class="font-semibold!">Email Address:</p>
            <p>malik@umn.edu, markl087@umn.edu, jagod023@umn.edu</p>
          </div>
        </div>
      </div>

      <!-- Study Staff -->
      <div>
        <p class="text-xl font-semibold!">Study Staff (if applicable)</p>

        <div class="border border-gray-300 rounded p-3 mt-2">
          <div class="grid grid-cols-2 gap-2">
            <p class="font-semibold!">Phone Number:</p>
            <p class="italic text-gray-500">Not provided</p>

            <p class="font-semibold!">Email Address:</p>
            <p class="italic text-gray-500">Not provided</p>
          </div>
        </div>
      </div>

      <!-- Supported By -->
      <p class="text-xl font-semibold!">
        <span class="font-bold!">Supported By:</span>
        This research is supported by the principal investigator.
      </p>

      <!-- Key Information -->
      <div>
        <p class="text-xl font-semibold!">Key Information You Should Know Before Agreeing to Participate</p>
        <p>
          The information below will help you learn about this research study and decide if you want to join.
          Make sure to read the whole consent form or have someone read it with you. If you have any questions
          or don't understand something, ask the researcher or study team before you sign the consent form.
        </p>
      </div>

      <!-- What is this study about -->
      <div>
        <p class="text-xl font-semibold!">What is this study about?</p>
        <p>
          This study is about the way that large language model (LLM) integration into searching tools like Google
          is influencing the way that humans search for and make sense of information. As prior work demonstrates
          LLM-related risks including the homogenization of ideas and atrophy of cognitive skills, we’re curious
          about whether similar effects are being manifested in the way LLM mediated search changes the process of
          searching and sensemaking itself.
        </p>
      </div>

      <!-- Why am I being asked -->
      <div>
        <p class="text-xl font-semibold!">Why am I being asked to take part in this research study?</p>
        <p>
          We are asking you to take part in this research study because we seek to understand the influence of LLMs
          on the searching and sensemaking behaviors of everyday information seekers. Participants are over 18 years
          of age, from the United States, and are unfamiliar with the topic of search.
        </p>
      </div>

      <!-- Risks -->
      <div>
        <p class="text-xl font-semibold!">What are the risks I should know about?</p>
        <ul class="list-disc ml-6!">
          <li>
            This study investigates information searching and sensemaking behaviors for a complex topic; because that involves searching for information on the internet, you may encounter information that conflicts with your internal beliefs.
          </li>
        </ul>
      </div>

      <!-- Benefits -->
      <div>
        <p class="text-xl font-semibold!">Will this study benefit me or others?</p>
        <ul class="list-disc ml-6!">
          <li>There are no benefits to you or others by participating in this study.</li>
        </ul>
      </div>

      <!-- What is research -->
      <div>
        <p class="text-xl font-semibold!">What is research?</p>
        <ul class="list-disc ml-6!">
          <li>The goal of research is to learn new things to help people in the future.</li>
          <li>Researchers follow the same plan with many participants.</li>
          <li>By volunteering, you might or might not be helped personally.</li>
        </ul>
      </div>

      <!-- Voluntary Participation -->
      <div>
        <p class="text-xl font-semibold!">Voluntary Participation and Right to Stop at Any Time</p>
        <ul class="list-disc ml-6!">
          <li>You get to decide whether you participate or not.</li>
          <li>You can decide not to participate.</li>
          <li>You can say yes at first and then change your mind at any time.</li>
          <li>Your decision will involve no penalty or loss of benefits.</li>
        </ul>
      </div>

      <!-- Duration -->
      <div>
        <p class="text-xl font-semibold!">How long will the research last?</p>
        <p>We expect that you will be in this research study for 20 minutes.</p>
      </div>

      <!-- Participation Requirements -->
      <div>
        <p class="text-xl font-semibold!">What will I need to do to participate?</p>
        <p>
          By signing up using this form, you are indicating that you are willing to participate in our study.
          You can only participate once.
        </p>

        <p>If you agree to participate, you will be asked to do the following:</p>

        <ol class="list-decimal ml-6!">
          <li>Fill out demographic, personality, and search tool preference questionnaires.</li>
          <li>Build an initial representation of your understanding of a new topic.</li>
          <li>Search for information and iteratively build upon your understanding.</li>
          <li>Fill out questionnaires about task difficulty and amount learned.</li>
          <li>Build a final representation of your understanding of the topic.</li>
        </ol>

        <p>
          We will record the data you provide. We will report this data anonymously or in aggregate.
          You may withdraw anytime before the final subtask and we will delete your data.
        </p>
      </div>

      <!-- Alternatives -->
      <div>
        <p class="text-xl font-semibold!">What happens if I do not want to be in this research?</p>
        <ul class="list-disc ml-6!">
          <li>There are no known alternatives, other than deciding not to participate.</li>
        </ul>
      </div>

      <!-- Costs -->
      <div>
        <p class="text-xl font-semibold!">Will it cost me anything to participate?</p>
        <ul class="list-disc ml-6!">
          <li>It will not cost you any money to participate.</li>
        </ul>
      </div>

      <!-- More Information -->
      <div>
        <p class="text-xl font-semibold!">More Information About This Research Study</p>
        <p>
          The following is more detailed information about this study in addition to the information listed above.
        </p>
      </div>

      <!-- Number of Participants -->
      <div>
        <p class="text-xl font-semibold!">How many people will be studied?</p>
        <p>We expect about 350 people to participate.</p>
      </div>

      <!-- What happens if I say yes -->
      <div>
        <p class="text-xl font-semibold!">What happens if I say “Yes, I want to be in this research”?</p>
        <p>
          You will proceed to questionnaires, then a search task, then post-study questionnaires,
          and finally a summary of what you learned.
        </p>
      </div>

      <!-- Changing Mind -->
      <div>
        <p class="text-xl font-semibold!">What happens if I say “Yes”, but I change my mind later?</p>
        <p>
          You can leave the research study at any time. Your academic standing or employment will not be affected.
        </p>
      </div>

      <!-- Removal -->
      <div>
        <p class="text-xl font-semibold!">Can I be removed from the research?</p>
        <p>
          The researcher or sponsor may remove you without your approval, primarily for invalid or incomplete data.
        </p>
      </div>

      <!-- Information Handling -->
      <div>
        <p class="text-xl font-semibold!">What happens to the information collected?</p>
        <p>
          Efforts will be made to limit the use and disclosure of your personal information.
          Organizations such as the IRB may inspect your information.
        </p>
        <p>
          Results may be published or shared publicly, but your identifying information will remain confidential.
        </p>
      </div>

      <!-- Contact -->
      <div>
        <p class="text-xl font-semibold!">Whom do I contact if I have questions or concerns?</p>
        <p>
          Contact the research team (see Investigator Contact Information).
        </p>
        <p>
          To reach someone outside the research team, contact the HRPP Research Participants’ Advocate Line:
          612-625-1650 (Toll Free: 1-888-224-8636) or visit z.umn.edu/participants.
        </p>

        <ul class="list-disc ml-6!">
          <li>Your questions are not being answered.</li>
          <li>You cannot reach the research team.</li>
          <li>You want to talk to someone else.</li>
          <li>You have questions about your rights.</li>
          <li>You want to provide feedback.</li>
        </ul>
      </div>

      <!-- Feedback -->
      <div>
        <p class="text-xl font-semibold!">Will I have a chance to provide feedback?</p>
        <p>
          HRPP may ask you to complete a survey. Participation is optional and anonymous.
        </p>
      </div>

      <!-- Compensation (commented out for pilot lul) -->
      <!-- <div>
        <p class="text-xl font-semibold!">Will I be compensated?</p>
        <p>
          You will be paid $5 for your time and effort.
        </p>
      </div> -->

      <!-- Publications -->
      <div>
        <p class="text-xl font-semibold!">How will my information be used in publications?</p>
        <p>
          Results may be published or presented, but identifying information will not be included.
        </p>
      </div>

      <!-- Documentation -->
      <div>
        <p>
          If you consent to participating, this survey response will document your consent.
        </p>
      </div>

    </div>
  </div>
  <div
    class="shadow flex justify-center items-center border p-1 rounded-2xl bg-white border-gray-300 mb-12! mt-6!">
    <button @click="emit('nextStep')"
      class="px-6 py-6 bg-indigo-500 text-white rounded-xl flex gap-x-2 justify-center items-center text-lg cursor-pointer hover:bg-indigo-600 transition-colors">
      I consent to participate in this study
    </button>
  </div>
</template>
