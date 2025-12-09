/**
 * Template Library
 *
 * Collection of document templates for different content types.
 * Each template provides structured prompts for AI assistance and manual writing.
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "academic" | "professional" | "general";
  generateTemplate: (analysis: any, chapterText: string) => string;
}

/**
 * Character Development Template
 * Focused on creating deep, compelling characters with complete arcs
 * Professional writer layout with minimal padding
 * Labels/headings are NOT editable; only placeholder fields are editable
 */
const fictionTemplate: Template = {
  id: "fiction",
  name: "Character Development",
  description:
    "For developing rich, multi-dimensional characters with complete character arcs",
  icon: "👤",
  category: "academic",
  generateTemplate: (analysis, chapterText) => {
    let template = `<div class="template-content" style="font-family: 'Georgia', serif; line-height: 1.6; max-width: 720px; margin: 0 auto;"><style>
.template-content, .template-content * { text-indent: 0 !important; }
.cf { width: 100%; padding: 4px 6px; border: 1px solid #d1d5db; border-radius: 2px; background: #fff; font-size: 13px; color: #888; font-style: italic; margin-top: 2px; min-height: 24px; cursor: pointer; }
.cf:focus { outline: none; border-color: #ef8432; background: #fff; color: #111; font-style: normal; }
.sec { border-left: 2px solid #ef8432; padding: 4px 8px; margin-bottom: 8px; }
.sec h2 { margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; }
.fld { margin-bottom: 4px; }
.lbl { display: block; font-size: 11px; font-weight: 600; color: #374151; user-select: none; pointer-events: none; }
</style>
<script>
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('cf') && e.target.dataset.sample) {
    e.target.textContent = '';
    delete e.target.dataset.sample;
  }
});
</script>`;

    // Header - NOT editable, no background, with border
    template += `<div contenteditable="false" style="padding: 6px 10px; border: 2px solid #c9a97c; border-radius: 3px; margin-bottom: 10px; user-select: none;">
<h1 style="margin: 0; font-size: 16px; font-weight: 700; color: #111;">Character Development Template</h1>
<p style="margin: 2px 0 0 0; font-size: 11px; color: #555;">Click any field to clear sample text and enter your own.</p>
</div>`;

    // Character Identity
    template += `<div class="sec">
<h2 contenteditable="false">Character Identity</h2>
<div class="fld"><span class="lbl" contenteditable="false">Character's Full Name</span><div class="cf" contenteditable="true" data-sample="true">Alex Ross Applegate</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Age & Life Stage</span><div class="cf" contenteditable="true" data-sample="true">Mid 20s—at the peak of physical capability yet still discovering the emotional depths of his calling. Old enough to have accumulated hard-won experience, young enough to still be shaped by it.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Occupation & Role in Story World</span><div class="cf" contenteditable="true" data-sample="true">Operative for a Covert Organization—the Agency. Alex exists in the liminal space between citizen and shadow, tasked with operations that never make the news yet shape the course of nations. His work demands he become whoever the mission requires while holding fast to his core identity.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Education & Intellectual Foundation</span><div class="cf" contenteditable="true" data-sample="true">B.S. Applied Mathematics, M.S. Linguistics. His academic background wasn't merely academic—it was strategic, forming the foundation of his multifaceted abilities. Mathematics taught him to see patterns in chaos; linguistics gave him the keys to infiltrate any culture, any circle, any conversation.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Physical Residence & Sanctuary</span><div class="cf" contenteditable="true" data-sample="true">Once he joined the Agency, Alex lived in a luxurious flat situated in a prime location. His home serves as both a sanctuary and a fortress, outfitted with the latest security measures. A private elevator provides exclusive access to his penthouse, ensuring both privacy and security. The top-floor residence offers panoramic views of the city, a constant reminder of what he's working to protect.</div></div>
</div>`;

    // Origin & Formation
    template += `<div class="sec">
<h2 contenteditable="false">Origin & Formation</h2>
<div class="fld"><span class="lbl" contenteditable="false">Background & Origin Story</span><div class="cf" contenteditable="true" data-sample="true">Alex's background is shrouded in secrecy due to his work with the Agency. He was trained by his uncle, the only surviving member of the British School of Assassins, at a young age due to his exceptional intellect, resourcefulness, and unwavering commitment to extensive and rigorous training, equipping him with the skills necessary to navigate the shadowy world of espionage. Raised in a family with military history, Alex always knew he was destined for a life far from ordinary. After excelling in his training, he was fast-tracked into special operations where he quickly made a name for himself.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Formative Years & Early Development</span><div class="cf" contenteditable="true" data-sample="true">In a world filled with ordinary lives, Alex's trajectory was anything but. At an age where most children were engrossed in games and school plays, he was tapped on the shoulder by destiny—or rather, by a covert intelligence program that saw something extraordinary in him. It all began with an unusual education. Instead of the standard subjects, his curriculum was meticulously designed around the arcane arts of intelligence and espionage. By the age of ten, Alex was fluent in multiple foreign languages, adept at breaking codes, and writing complex computer programs. While his peers played with toys, Alex was engrossed in blueprints and engineering puzzles.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Training & Physical Discipline</span><div class="cf" contenteditable="true" data-sample="true">As he grew, so did his skillset. His after-school hours, which would've been filled with games and mischief for any other child, were dominated by rigorous martial arts training. Aikido and Ba Qua not only strengthened his body but sharpened his mind, teaching him the importance of balance, agility, and precision. With every move, Alex learned to anticipate and counteract, turning defense into offense in a heartbeat. His prowess wasn't limited to physical combat. Alex was schooled in the intricacies of the human psyche, learning to detect the minutest shifts in body language, the subtleties of tone and facial expressions.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">World Experience & Cultural Mastery</span><div class="cf" contenteditable="true" data-sample="true">He was a sponge, absorbing everything from history to politics, from law to economics. His education wasn't confined within the four walls of a classroom. Alex traveled the world, experiencing cultures, learning etiquettes, and mastering local accents. Whether it was the dance of Spain or the customs of Japan, Alex could seamlessly fit in, a chameleon in every setting. His teenage years were marked with adrenaline. Guided by veteran agents, Alex undertook staged missions, navigating real-world challenges and facing dangers that would send chills down anyone's spine.</div></div>
</div>`;

    // Skills & Capabilities
    template += `<div class="sec">
<h2 contenteditable="false">Skills & Capabilities</h2>
<div class="fld"><span class="lbl" contenteditable="false">Combat & Weapons Proficiency</span><div class="cf" contenteditable="true" data-sample="true">Expert marksman, proficient in a wide range of firearms. He can handle pistols, rifles, and even specialized covert weapons with precision and accuracy. Skilled in hand-to-hand combat and self-defense techniques, having learned Aikido, allowing him to handle physical confrontations with ease. He has received extensive training in explosives, both in their use and defusal. This knowledge allows him to manipulate explosives for various purposes, from breaching to diversion.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Technical & Tactical Expertise</span><div class="cf" contenteditable="true" data-sample="true">Alex has acquired an understanding of poisons and toxins, primarily for defensive purposes. He knows how to identify, handle, and counteract poisons, providing an additional layer of protection in his line of work. He is adept at surveillance, tracking, and infiltration. He can blend seamlessly into different environments and gather intelligence without raising suspicion.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Psychological & Interpersonal Skills</span><div class="cf" contenteditable="true" data-sample="true">Multilingual. Schooled in the intricacies of the human psyche, learning to detect the minutest shifts in body language, the subtleties of tone and facial expressions. This, coupled with his training in emotional control, made him an expert deceiver, a human lie detector. The world of acting appealed to Alex not for fame, but for its potential in undercover operations. He learned to wear masks, not of fabric, but of personalities, becoming whoever he needed to be.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Operational & Vehicle Mastery</span><div class="cf" contenteditable="true" data-sample="true">The art of driving wasn't just about moving from point A to B for Alex; it was about evading, pursuing, and maneuvering with the kind of precision most would find in a choreographed dance. He could pilot boats with the same ease he could helicopters, making him a force to be reckoned with on land, water, or air. When situations became dire, his training in interrogation resistance and first aid proved invaluable.</div></div>
</div>`;

    // Personality Architecture
    template += `<div class="sec">
<h2 contenteditable="false">Personality Architecture</h2>
<div class="fld"><span class="lbl" contenteditable="false">Core Personality Traits</span><div class="cf" contenteditable="true" data-sample="true">Reserved, intelligent, resourceful, driven by a sense of justice. Alex was not just a spy; he was a symbol of unparalleled commitment and dedication. Despite his many talents, what set Alex apart was his unwavering sense of purpose. He knew his mission—protecting the interests of his nation, even at the cost of his personal life.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Operating Principles & Code</span><div class="cf" contenteditable="true" data-sample="true">1. Never do business with friends or relatives. 2. Two can keep a secret if one of them is dead. 3. Never do the expected. 4. Always monitor a situation from afar. 5. Never leave any evidence behind. 6. Planning is imperative. Make a plan, but plan for the unexpected. Each rule shaped his actions, ensuring his survival in a game where the cost of failure was death.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Inner Life & Private Struggles</span><div class="cf" contenteditable="true" data-sample="true">Beneath the layers of aliases and disguises, the heart of a young boy who once dreamt of a simpler life still beat. Every so often, in the quiet of the night, Alex would reminisce about the paths not taken, the life he could've had. But he never let regret overshadow his duty. Yet, even as he danced through gunfire, sped through narrow alleys, or deceived enemies, there was a solitary truth Alex held onto: the line between right and wrong was often blurred in his line of work. Moral dilemmas were frequent visitors, and choices were seldom black and white.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Adaptability & Social Masks</span><div class="cf" contenteditable="true" data-sample="true">The world around him was a chessboard, and he was both the player and the pawn. Whether it was infiltrating elite circles in Monaco or tracking arms dealers in the alleys of Marrakech, Alex's adaptability was his greatest asset. High society balls or underground fight clubs, there wasn't an environment he couldn't dominate. With every passing year, the real Alex became harder to find. Layers of identities were created, each supported by a web of fabricated stories and documents, enabling him to dive deep undercover, often losing himself to become someone entirely different.</div></div>
</div>`;

    // Relationships & Connections
    template += `<div class="sec">
<h2 contenteditable="false">Relationships & Connections</h2>
<div class="fld"><span class="lbl" contenteditable="false">Family Dynamics</span><div class="cf" contenteditable="true" data-sample="true">Alex maintains a distant relationship with his family, having been estranged from them for years due to the nature of his work. He has chosen to keep them at arm's length to protect them from the dangers that come with his profession. His early grooming in the world of espionage made him understand the impermanence of relationships. Friendships were fleeting, love was a luxury, and trust was the rarest of commodities.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Romantic Relationship & Anchor</span><div class="cf" contenteditable="true" data-sample="true">Allison is Alex's anchor to the normalcy he craves in his otherwise clandestine life. Their relationship provides him with a sense of emotional connection and stability. However, he is often forced to keep details of his work from her to protect her safety. She was his touchstone to normalcy, the person who grounded him amid the chaos of his clandestine operations. Yet, even she could not know the depths of his life, the daily dance with danger that was his to perform alone.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Allies & Professional Bonds</span><div class="cf" contenteditable="true" data-sample="true">Kiko from his past; a reminder of his vulnerabilities. Alex's expertise with firearms, explosives, and poisons were tools of his trade, each as essential as the air he breathed. Hand-to-hand combat was a language he spoke fluently, and surveillance was second nature. These skills, honed to a razor's edge, were his arsenal in a war fought in the shadows.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Loyal Companion</span><div class="cf" contenteditable="true" data-sample="true">Alex has a Belgian Malinois named Max, who is not just a loyal companion but also an indispensable asset in his line of work. Max is not just a pet but a highly trained working dog with a keen sense of loyalty and protection. Max is trained in both obedience and protection, making him an invaluable asset to Alex's work. In the labyrinthine corridors of the Agency, it was here that he shared his life with Max, a Belgian Malinois more partner than pet, whose keen senses and training were matched only by Alex's own skills.</div></div>
</div>`;

    // Psychology & Inner Need
    template += `<div class="sec">
<h2 contenteditable="false">Psychology & Inner Need</h2>
<div class="fld"><span class="lbl" contenteditable="false">Ghost (Backstory Wound)</span><div class="cf" contenteditable="true" data-sample="true">Haunted by Dana's loss and operating in the espionage world. The narrative of "The Silent Operator" is one of duality—the man and the myth, the operative and the individual. Alex Ross Applegate, a prodigy turned legend, was both the player and the pawn in a game much larger than himself.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Core Weakness & Psychological Need</span><div class="cf" contenteditable="true" data-sample="true">Isolated and emotionally guarded, needs to open up to others. His early grooming in the world of espionage made him understand the impermanence of relationships. Friendships were fleeting, love was a luxury, and trust was the rarest of commodities. Yet, beneath the layers of aliases and disguises, the heart of a young boy who once dreamt of a simpler life still beat.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">False Belief & Moral Complexity</span><div class="cf" contenteditable="true" data-sample="true">The line between right and wrong was often blurred in his line of work. Moral dilemmas were frequent visitors, and choices were seldom black and white. In the grand tapestry of global geopolitics, Alex was but a thread, albeit a crucial one. Through his eyes, the world was a complex puzzle, ever-changing and unpredictable.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">What Grounds the Character</span><div class="cf" contenteditable="true" data-sample="true">In the world of espionage, where the stakes were always high, Alex found solace in the small moments—the scent of a familiar perfume reminding him of a long-lost love, the laughter of children bringing back memories of a childhood left behind, or the taste of a home-cooked meal evoking feelings of a family he once had. For Alex, the mission was clear, the path set. No matter where destiny took him, he was ready, always one step ahead, always in the shadows, watching, waiting, and acting for the greater good.</div></div>
</div>`;

    // 22-Step Character Arc
    template += `<div class="sec">
<h2 contenteditable="false">22-Step Character Arc</h2>
<div class="fld"><span class="lbl" contenteditable="false">1. Self-Revelation, Need & Desire</span><div class="cf" contenteditable="true" data-sample="true">Alex realizes he needs to confront his past to move forward. The weight of unresolved history prevents him from fully engaging with his present and future.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">2. Ghost & Story World</span><div class="cf" contenteditable="true" data-sample="true">Haunted by Dana's loss and operating in the espionage world. This ghost shapes every decision, every relationship, every moment of vulnerability he allows himself.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">3. Weakness & Need</span><div class="cf" contenteditable="true" data-sample="true">Isolated and emotionally guarded, needs to open up to others. His protective walls have become his prison.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">4. Inciting Event</span><div class="cf" contenteditable="true" data-sample="true">Receives a cryptic message about Dana. The past he thought buried refuses to stay dead.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">5. Desire</span><div class="cf" contenteditable="true" data-sample="true">To uncover the truth about Dana's mission. This external goal masks his deeper need for closure and redemption.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">6. Ally</span><div class="cf" contenteditable="true" data-sample="true">Kiko from his past; a reminder of his vulnerabilities. The ally serves as a mirror, reflecting both his strengths and his blind spots.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">7. Opponent</span><div class="cf" contenteditable="true" data-sample="true">The mysterious forces behind Dana's disappearance. The opponent represents everything Alex fears—the cost of caring in a world that punishes connection.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">8. Fake-Ally Opponent</span><div class="cf" contenteditable="true" data-sample="true">A colleague in the Agency who secretly opposes him. Trust, always fragile, becomes impossible when those closest harbor hidden agendas.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">9. First Revelation & Decision</span><div class="cf" contenteditable="true" data-sample="true">Discovers Dana might be alive; decides to find her. Hope, that dangerous emotion he'd learned to suppress, resurfaces with devastating force.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">10. Plan</span><div class="cf" contenteditable="true" data-sample="true">To use his skills to trace Dana's last mission. He applies his tradecraft to personal ends, crossing lines he once held sacred.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">11. Opponent's Plan & Counterattack</span><div class="cf" contenteditable="true" data-sample="true">The Agency tries to stop him, fearing exposure. The institution that made him now seeks to unmake his pursuit of truth.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">12. Drive</span><div class="cf" contenteditable="true" data-sample="true">Pushes forward despite warnings, using his surveillance expertise. Each step deeper into the mystery takes him further from safety and closer to transformation.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">13. Attack by Ally</span><div class="cf" contenteditable="true" data-sample="true">Kiko criticizes him for his obsession with Dana. The truth hurts most when spoken by those who truly see us.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">14. Apparent Defeat</span><div class="cf" contenteditable="true" data-sample="true">Believes Dana is dead after a misleading lead. The lowest point reveals what he truly values—and what he's willing to sacrifice.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">15. Second Revelation & Decision</span><div class="cf" contenteditable="true" data-sample="true">Learns that Dana was on a covert mission against the Agency. The truth reframes everything—enemies become allies, loyalty becomes betrayal.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">16. Audience Revelation</span><div class="cf" contenteditable="true" data-sample="true">Dana is working undercover to expose corruption. The reader sees what Alex cannot yet grasp—that love and duty need not be opposing forces.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">17. Third Revelation & Decision</span><div class="cf" contenteditable="true" data-sample="true">Decides to go rogue to help Dana. He chooses relationship over institution, humanity over protocol.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">18. Gate, Gauntlet, Visit to Death</span><div class="cf" contenteditable="true" data-sample="true">Confronts the corrupt officials at the risk of his life. He faces literal and symbolic death—the death of his old self, his old beliefs, his old limitations.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">19. Battle</span><div class="cf" contenteditable="true" data-sample="true">A physical and ideological battle against the Agency's corruption. The external conflict crystallizes the internal transformation.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">20. Self-Revelation</span><div class="cf" contenteditable="true" data-sample="true">Realizes his love for Dana is his strength, not weakness. What he thought made him vulnerable actually makes him formidable.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">21. Moral Decision</span><div class="cf" contenteditable="true" data-sample="true">Chooses to leave the Agency and fight for the truth with Dana. He acts on his new understanding, cementing his transformation through irrevocable choice.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">22. New Equilibrium</span><div class="cf" contenteditable="true" data-sample="true">Lives a life balancing between love and vigilance against corruption. He has integrated his need for connection with his skills and purpose, achieving wholeness.</div></div>
</div>`;

    // Thematic Resonance
    template += `<div class="sec">
<h2 contenteditable="false">Thematic Resonance</h2>
<div class="fld"><span class="lbl" contenteditable="false">Central Theme & Duality</span><div class="cf" contenteditable="true" data-sample="true">The narrative is one of duality—the man and the myth, the operative and the individual. Alex Ross Applegate's life was a tapestry of shadows and secrets, intricately woven since his childhood. Each chapter of his life, each assignment he undertook, was a step in an eternal dance—a dance of intellect, of power, of survival. It is here, in the silence of his actions, that the true essence of Alex Ross Applegate—the silent operator—comes to light, a beacon in the darkness of a world fraught with secrets and lies.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Legacy & Reputation</span><div class="cf" contenteditable="true" data-sample="true">As years passed, the young prodigy turned into a legend within the intelligence community. Stories of his exploits were whispered in the corridors of power, often with a mix of admiration and envy. Yet, to the world outside, he remained a ghost, a myth, a nameless hero guarding the shadows. Alex was not just a spy; he was an embodiment of human potential, a testament to what one could achieve with the right training, guidance, and determination.</div></div>
<div class="fld"><span class="lbl" contenteditable="false">Existential Purpose</span><div class="cf" contenteditable="true" data-sample="true">In the grand tapestry of global geopolitics, Alex was but a thread, albeit a crucial one. Through his eyes, the world was a complex puzzle, ever-changing and unpredictable. But for Alex, the mission was clear, the path set. No matter where destiny took him, he was ready, always one step ahead, always in the shadows, watching, waiting, and acting for the greater good.</div></div>
</div>`;

    template += `</div>`;
    return template;
  },
};

/**
 * Non-Fiction Writing Template
 * For articles, guides, memoirs, and informational writing
 * Uses Cream & Tan backgrounds from colorPalette.md
 */
const generalContentTemplate: Template = {
  id: "nonfiction",
  name: "Non-Fiction Writing",
  description: "For articles, memoirs, essays, and informational content",
  icon: "✍️",
  category: "general",
  generateTemplate: (analysis, chapterText) => {
    const cognitiveLoad =
      analysis.principles?.find((p: any) => p.principle === "cognitiveLoad")
        ?.score || 0;

    // Wrapper resets text-indent for all nested elements to override PaginatedEditor's default
    let template = `<div style="font-family: Inter, system-ui, sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px;" class="template-content"><style>.template-content, .template-content * { text-indent: 0 !important; }</style>`;

    // Header with obvious tan background
    template += `<div style="background-color: #c9a97c; padding: 24px; border-radius: 12px; margin-bottom: 32px; border: 2px solid #a67c52; text-align: left; text-indent: 0 !important;">
      <h1 style="margin: 0 0 8px 0; font-size: 28px; color: #111827; text-align: left; text-indent: 0 !important;">✍️ Non-Fiction Writing Template</h1>
      <p style="margin: 0; font-size: 14px; color: #111827; text-align: left; text-indent: 0 !important;">Improve clarity, engagement, and readability of your content.</p>
    </div>`;

    // Introduction Section - Cream background
    template += `<div style="background: #fef5e7; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">🎯 Introduction & Hook</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Engaging Opening]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Start with a compelling hook: a question, surprising fact, relatable scenario, or bold statement. Clearly state what the reader will learn and why it matters to them.</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Craft Attention-Grabbing Opening]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "Write an engaging 2-3 sentence introduction for this content that hooks the reader immediately. Include either: a thought-provoking question, a surprising statistic, or a relatable problem. Then clearly state the benefit of reading. Topic: [paste topic/summary]"
        </code>
      </div>
    </div>`;

    // Main Content Section - Light tan background
    template += `<div style="background: #f7e6d0; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">📚 Main Content & Key Points</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Structure Your Content]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Break content into 3-5 main sections with clear subheadings. Each section should cover one key idea. Use short paragraphs (3-4 sentences max) and bullet points for scannability.</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Create Content Outline]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "Create a logical outline for this content with 3-5 main sections. For each section: 1) suggest a clear subheading, 2) list 2-3 key points to cover, 3) recommend one supporting element (example, statistic, or story). Here's the content: [paste draft]"
        </code>
      </div>
    </div>`;

    // Examples & Clarity Section - Cream background
    template += `<div style="background: #fef5e7; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">💡 Examples & Practical Application</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Add Concrete Examples]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">For each main concept, provide a real-world example or analogy. Use "For instance..." or "Imagine..." to introduce examples. Make abstract ideas concrete and relatable.</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Generate Examples]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "For this concept, create 2-3 concrete examples that make it immediately understandable. Use everyday situations, analogies, or scenarios. Make sure examples are diverse and relatable to different audiences. Here's the concept: [paste concept explanation]"
        </code>
      </div>
    </div>`;

    // Visual Elements Section - Light tan background
    template += `<div style="background: #f7e6d0; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">🎨 Visual Enhancement</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #10b981;">[VISUAL - Add Supporting Visuals]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Consider adding:</p>
        <ul style="margin: 8px 0; padding-left: 24px; color: #111827;">
          <li>Infographics summarizing key data</li>
          <li>Photos or illustrations showing examples</li>
          <li>Simple diagrams explaining processes</li>
          <li>Pull quotes highlighting important points</li>
          <li>Icons to break up text and mark sections</li>
        </ul>
      </div>
    </div>`;

    // Conclusion Section - Cream background
    template += `<div style="background: #fef5e7; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">🎬 Conclusion & Next Steps</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Strong Closing]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Summarize the 1-3 most important takeaways. End with a clear call-to-action or next step for the reader. What should they do with this information?</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Create Actionable Conclusion]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "Write a compelling conclusion that: 1) summarizes the key takeaways in 2-3 sentences, 2) provides a specific, actionable next step, 3) leaves the reader feeling motivated. Here's the content: [paste main points]"
        </code>
      </div>
    </div>`;

    if (cognitiveLoad < 70) {
      template += `<div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
        <h2 style="margin: 0 0 12px 0; color: #991b1b; font-size: 20px;">⚠️ Readability Check (Cognitive Load: ${Math.round(
          cognitiveLoad
        )}/100)</h2>
        <p style="margin: 0; color: #7f1d1d;">Your content may be too dense. Consider: breaking long paragraphs, using more headings, adding white space, simplifying complex sentences, and including more examples.</p>
      </div>`;
    }

    // Footer
    template += `<div style="background: #eddcc5; padding: 20px; border-radius: 8px; margin-top: 24px; border: 1px solid #e0c392;">
      <p style="margin: 0; color: #111827; font-size: 14px;"><strong>Next Steps:</strong> Work through each section systematically. Use the [CLAUDE] prompts for AI assistance. Add visuals where marked. Review for clarity and flow before publishing.</p>
    </div>`;

    template += `</div>`;
    return template;
  },
};

/**
 * Template Library - All available templates
 */
export const TEMPLATE_LIBRARY: Template[] = [
  fictionTemplate, // Fiction Writing
  generalContentTemplate, // Non-Fiction Writing
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | undefined {
  return TEMPLATE_LIBRARY.find((t) => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: Template["category"]
): Template[] {
  return TEMPLATE_LIBRARY.filter((t) => t.category === category);
}
