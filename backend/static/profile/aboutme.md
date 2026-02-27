# Overview
- Highly analytical and versatile AI Engineer with a strong foundation in Electrical Engineering from IIT Patna. I specialize in building complex, multi-agent RAG (Retrieval-Augmented Generation) systems and end-to-end AI applications. 
- My background bridges the gap between hardware-level logic (SRAM design) and high-level AI orchestration (n8n, LangChain, OpenAI).
- Key Soft Skills & Competencies:
**Problem Solving & Logical Reasoning**: Proven through high competitive programming ranks (Codeforces Expert, 5★ CodeChef) and JEE Advanced success. JEE Advanced AIR 9857, JEE main 97.33 Percentile, RITEEC 2025 Research Paper Publication, Shell.ai Hackathon Rank 26/1500.
**Leadership & Management**: Demonstrated through roles as Hostel Secretary and Club Coordinator, managing large-scale events and multi-stakeholder logistics. Anime Club Coordinator, E-Cell Sub-Coordinator, Hostel Secretary,
**Technical Communication**: Experienced in writing high-impact technical documentation (FRDs) and peer-reviewed research papers (accepted at RITEEC 2025).
**Adaptability**: Proficient in switching between Python-based backend development, React frontend, and working on debugging in NodeJS/TypeScript. Quick learning and adaptation to server deployement using Nginx.

# Index 
1. Experience 
- a. AI Engineer at TechGropse pvt Ltd - Noida 
    i. RAG Chatbots for Chemical E-commerce (Chemfalcon & Nischem) (Python, FastAPI, ReactJS, MongoDB Atlas, Vector Search, OpenAI, Azure Translator, Multi-Agent Architecture, Session Isolation, Intelligent Caching) 
    ii. FRD Generator using n8n and Flutter (n8n, Python, JavaScript, Flutter, Dart, Multi-Agent Orchestration, Google Workspace API, Workflow Automation)
    iii. Stateful RAG-Based Product Exploration (Bianca & Artera) (NodeJS, Express, TypeScript, Fastify, OpenAI Stateful Assistants API, MongoDB Atlas, Keyword Extraction, JSON Caching)
- b. Internship - Web Designer at TechGropse 
    i. Scanned PDF to Online Attemptable Format Converter (Python, Flask, OpenCV, Tesseract OCR, Google Cloud Vision, OpenAI, AWS S3, MongoDB, Nginx, AWS EC2, Fullstack)

2. Personal Projects 
- a. Web Development Projects 
    i. Portfolio Website with RAG Chatbot (Python, FastAPI, ReactJS, Docker, Vercel, Llama 3, Groq API, RAG, Web Scraping, IP-based Geolocation)
    ii. Embedded Non-Textual PDF Elements Extractor (Python, Flask, ReactJS, Tesseract, OpenCV, Image Processing, Docker, Vercel, Fullstack)
    iii. Responsive Movie Website (HTML5, CSS3, JavaScript, UI/UX Design, GitHub Pages)
- b. Data Science/ Machine Learning Projects 
    i. Emotion Detection from Text (Python, Scikit-Learn, SVM, NLP, TF-IDF, Feature Engineering, Jupyter Notebook)
    ii. Bitcoin Price Prediction (Python, TensorFlow, Keras, LSTM, Time Series Forecasting, Data Analysis)
    iii. Seizure Detection (CNN & BiLSTM) (CNN, BiLSTM, EEG Signal Processing, Deep Learning, Predictive Modeling)
- c. Core Electrical Projects 
    i. Research Project: BP Regulation via Hippopotamus Optimization Algorithm (MATLAB, Hippopotamus Optimization Algorithm, Control Systems, FOPI Controller, LaTeX, Mathematical Modeling)
    ii. RFID-based Attendance Manager (Arduino, C++, RFID Technology, Hardware Integration, Embedded Systems)
    iii. 16-Bit SRAM Design (Cadence Virtuoso, CMOS Logic, VLSI Design, Power Optimization, Low-leakage Design)
    iv. Temperature Data Transmitter (Arduino, RF Communication, Sensor Integration, Thermistor Calibration)

3. Achievements (Codeforces Expert, CodeChef 5★, JEE Advanced AIR 9857, RITEEC 2025 Publication, Shell.ai Hackathon Rank 26/1500, LightGBM, KFold Cross-validation)

4. Skills (Leadership, Management, Anime Club Coordinator, E-Cell Sub-Coordinator, Hostel Secretary, Piano)

5. Extracurricular (Leadership, Management, Anime Club Coordinator, E-Cell Sub-Coordinator, Hostel Secretary, Piano)


# Experience

## AI Engineer at TechGropse pvt Ltd - Noida (sep 2025 - present)

### RAG Chatbots for chemfalcon (sinle vendor) and nischem (multi vendor) chemical e commerce websites. 
- Stack : Python(FastAPI), ReactJS, MongoDB, OpenAI, Azure,
- The chatbot have a 3 agent series architechture, each specialising in their specific part of the complete e commerce experience.
- First Agent is a RAG-enabled agent that extracts keywords from the user query and then calls the RAG tools to fetch the relevant products from the vast list of products in the database. And shows their list and details to customer. And helps them to select the product they want.
- Then the First agent asks for the action he wants to make for the product. Options - Order, PPR (purchase price request), Sample, Quotation. After confirming the product and the action type, the first agent switches the route so all the subsequent messages go to the second agent.
- RAG is implemented using MongoDB atlas.
- The second agent is the agent that takes details like unit, quantity, phone number, email, packaging type etc. And validates each before proceeding.
- The second agent ensures that all the details are validated through dedicated tools at each step of the chat. No matter if the user provides each detail one by one or all in a single message.
- After all details are collected and validated, it saves them to the database and updates the routing path so all subsequent messages go to the third agent now.
- The third agent has a HTTP request tool which fetches the addresses from the user's profile and the industry options from the website database and presents them as a list and asks the user to select them by index number.
- After the address and the intended industry are selected, the third agent calls the address placement tool. This tool fetches all the order details saved by the agents in the MongoDB database and places the order with the requested product, action type, order details, and address.
- After the request completes, the third agent returns an intelligent reset button to the chat window to reset the chat and start a new request.
- This chatbot ensures a complete e commerce experience with intelligent caching of fetched products in mongoDB,to show/sort and recommend curated product based on user's needs.
-  session isolation is implemented using unique SessionID, no hallucination in important details using dedicated validation tools for each step.
- Added an interception layer that saves the interaction and ensures the safety of the exchange. blocks unauthorized access attempts into the chatbot.
- Added translation layer using Azure translator for multilingual support. 
- Created custom frontend using ReactJS to test the chatbot under development then wrote the frontend code of chatbot interface in the deployment project too.

### Functional Requirement Document (FRD) Generator Using n8n and Flutter (Dart)
- Made a FRD generator n8n pipeline using Two agent series architecture.
- User gives a project Idea with scope as text, the first agent expands the project idea into a complete functional project of 'What' features, workflow, pages, requirements, issues, etc the project would be having and passes it to the second agent.
- The second agent analyses the requirements, and creates a complete comprehensive document of 'How' the project would be implemented using the tech stack, tools, technologies, workflows, databases etc. In a clear markdown format.
- The output of the second agent is parsed and saved in a new google sheet automatically in the user's Gdrive account. And also returned to the user.
- n8n's code block's code were written using Python and JavaScript 
- The Frontned code was written in Flutter (Dart) using AI. And handles the request sending and response receiving from the n8n workflow.

### RAG-Based Product Exploration chatbot for Bianca and Artera websites
- Implemented intelligent RAG-Enabled product Exploration chatbots for Bianca (Fashion E commerce platform) and Artera (Service provider platform) using NodeJS(Express) and TypeScript(Fasify) respectively.
- Both chatbots are implemented using the modern stateful OpenAI responses API instead of the widely used chat_completions API (stateless). This API the context during API calls by a messageID field instead of sending chat history and system prompt each time, saving a lot of tokens at each interaction.
- The RAG tool (MongoDB atlas) returns the relevant products/services as per the keywords extracted from the User's message and history of keywords searched and context of the chat session. And saves the JSON in the cache in mongoDB which is accessible to chatbot.
- The AI agent analyses the returned JSON and shows the relevant products in the desired order as per the user's intent.
- Has another RAG tool to fetch website and company data for non-product related questions on each website.


## Internship - Web Designer at at TechGropse (May 2024 – Jan 2025)

### Scanned Question paper PDFs to online attemptable format converter
- Built an application using Python (Flask) to convert Scanned Copies of printed question papers into an online attemptable format.
- The project employed a 10-step serial process involving:
1. Extraction of diagrams, tables from the PDF whose entire page is an image itself, then putting placeholders in their place. Used OpenCV and pyTesseract
2. OCR on the PDF with those placeholders and text using Google Cloud Vision
3. Restructuring and correcting the raw OCRed text to correct form using OpenAI API
4. Converting the processed Text to a clear JSON using OpenAI API
5. Rejoining Broken images, uploading them to Amazon S3 and obtaining their links
6. Putting the links back in the placeholders in the JSON.
7. Modifying the JSON in the client provided Format.
8. Extracting the Paper details from first Page and adding them to the JSON as metadata.
9. Inserting the JSON in mongoDB.
10. Fetching the data and loading in the Custom Frontend made by JS which becomes an Online paper which students can attempt.
- Deployed the project on a remote AWS T2 Medium server using Mobaxterm in SSH mode. And used nginx for permanent deployment. 
- The entire backend was planned, designed and made by Gaurav from end to end.
- The project was near 100% accurate when the input papers were clear and diagrams were proper.
- Overall accuracy of final online interface was more than 95 percent.

# Personal Projects
## Web Development Projects

### Portfolio Website with RAG Chatbot
- Backend Made using Python (FastAPI): Deployed on Docker
- Backend manages Chatbot on the website and Fetching the Codeforces and Codechef Profile stats for plotting the Ratings Graph.
- Chatbot made using llama 3 model using Groq API key.
- Chatbot has RAG to fetch the relevant data before API calls.
- Frontend Made using ReactJS : Deployed on Vercel
- Frontend consists of 4 Pages respectively for Home, skills, projects, and timeline.
- Has introduction page which renders the salutation message based on user's login location based on IP.
- Plots the graph using the data from the competitive programming profiles.
- State based changing the GIF of Yuki-chan Chatbot based on the state of API call on Gaurav's portfolio website.


### Embedded Non-Textual PDF Elements Extractor: Full-stack (Flask + React)
- It is an improvement of internship project. 
- It employes Teserract and OpenCV to Extract Diagrams, Tables and Figures from Images of Multiple types of PDF documents.
- Frontend made in react for Uploading PDF and showing the extracted images.
- Has extra feature for viewing, selecting and then downloading the compressed folder of selected images.
- Deployed the project backend on docker and Frontend in Vercel.

### Responsive Movie Website: 
- First Frontend project.
- Made using HTML, CSS and JavaScript. 
- with intellignent search bar. 
- Featuring movie preview pages and 15+ movie listings.
- Deployed on GitHub

## Data Science/ Machine Learning Projects

### Emotion Detection from Text: 
- Project from HCL that Helped Gaurav qualify for Onsite Data Analytics Hackathon round in Bangalore
- Built an SVM emotion classifier using Python (Google Colab Jupyter Notebook) to classify emotions from text input.
- Pre processing involved emoji removal, TF-IDF feature engineering.
- SVM model trained on more than 35000 labelled tweets.
- Achieved 70% precision Score.

### Bitcoin Price Prediction 
- Trained LSTM model on 3 years of historical price data of Bitcoins.
- Achieved training variance score of 0.993 and testing variance score of 0.987.

### Seizure Detection: 
- Trained Convolutional neural networks (CNN) and Bidirectional Long Short Term memory (BiLSTM) on Electroencephelogram (EEG) data to predict upcoming seizure for pre warning.
-  Achieved 99% training accuracy and 98 percent testing validation accuracy.

## Core Electrical Projects

### Research Project : BP Regulation using Hippopotamus Optimization algorithm.
- Problem : Regulation of Blood pressure During Operation of Hypertensive patients using sodium nitroprusside, a BP regulator Drug.
- Problem Statement : A mathematical Equation representing the change in Blood pressure depending upon the injection of SNP drug in human body. And needing to design a Fractional Order Proportional-Integral (FOPI) controller to make control the Drug Injection Rate.
- Multiple people attempted this but had tradeoffs. 
- Approach - Used H-infinity criteria based graphical approach to plot Kp vs Ki graph to find the Stable region of the variables of the controller.
- Then used Hippoportamus Optimization algorithm in MATLAB to simulate the responses and minimize Integral Errors: Integral Absolute Error (IAE), Integral Squared Error (ISE), Integral Time Absoute Error (ITAE).
- The Kp and Ki values giving least Error is taken to simulate and extract the Settling Time, Maximum Overshoot, Steady State Error and other performance metrics.
- Settling time was reduced by 30-60% compared to latest researches.
- Maximum Overshoot reduced by multiple order of magnitudes compared to latest researches which used advanced FOPID controllers.
- Steady State Error was reduced by 90 to 98 percent compared to reference papers.
- Wrote the entire research paper from Scratch in LaTeX.
- Paper got accepted in RITEEC International Conference 2025 held at NIT Patna, and currently under publication.

### RFID based Attendance manager
- Used Arduino UNO R3 to make a RFID attendance sensor to keep track of multiple people's attendances, including Person detection, IN and Out times. 
- Coded in Arduino started with testing each hardware component separately then All at the same time before implementing the actual attendance logic.

### 16 Bit SRAM
- Made a 16 Bit (Static Random Access Memory) SRAM in Cadence Virtuoso to Store, Extract and Modify four sets of 4 bits.
- Made a 8 Transistor Sleepy keeper SRAM cell using CMOS.
- Made a one bit SRAM cell using those Gates, converted in a single Block, Used 4*4 Combination to make the SRAM
- Made a custom Writer, Eraser and modifier modules (Multiplexer for Read/Write operations and Demultiplexer for word line selection) using logic gates made from Transistors to Control the Bits stored.
- Operational power of 8 transistor SRAM cell reduced to 462 microwatts compared to Traditional 650 microwatt power usage of 6 transistor SRAM cell.
- Reduced the read and write delays compared to 6T RAM design.
- 2 more CMOS were used to reduce leakage power in OFF state.

### Temprature Data Transmitter
- Part of a group project.
- Coded the Arduino UNO at sender and receiver module for transmission of temprature data using RF modules.
- Configured the Thermistor module's output to respond with the correct temperature value to calculate the temprature correctly from the curent value.


# Achievements
- Expert on Codeforces Max: 1607 (Profile Link in portfolio and Resume)
- 5★ on CodeChef (Max: 2018) (Profile Link in portfolio and Resume)
- JEE Advanced All India Rank: 9857, OBC rank: 1958 
- 97.33 Percentile in JEE Main 2021 out of 1 Million Candidates.
- 93.4 Percent in CBSE Class 10th Board Exams (High School).
- 93.4 Percent in CBSE Class 10th Board Exams ( Intermediate ).
- 76.9 Percent in Bachelor of Technology(B.Tech) in Electrical and Electronics Engineering (EEE) from Indian Institute of Technology (IIT) Patna
- 1st author research paper (FOPI controller) accepted at RITEEC 2025, NIT Patna
- Overall ranked 26 out of 1500 Teams in Shell.ai Machine learning model training Hackathon to predict the fuel blend properties. Employed a powerful LightGBM and FFT Transformer ensemble, and rigorously validated via KFold Cross-validation, culminating a 94.00831 leaderboard score.

# Technical Skills
- **Programming Languages**: Python, C++, JavaScript (ES6+), TypeScript, Dart, HTML5, CSS3, MATLAB, LaTeX.

- **AI & Machine Learning**: RAG (Retrieval-Augmented Generation), Multi-Agent Orchestration, LLMs (OpenAI, Llama 3), Prompt Engineering, Computer Vision (OpenCV, Tesseract), CNN, LSTM, Scikit-Learn, TensorFlow, Keras.

- **Backend Development**: FastAPI, Flask, Django, Node.js, Express, n8n (Workflow Automation), REST APIs.

- **Frontend Development**: ReactJS, Flutter, Mobile UI/UX Design.

- **Database & Cloud**: MongoDB (Atlas & Vector Search), MySQL, Amazon S3, Azure (Translator), Google Cloud Vision, AWS (EC2/T2 Medium).

- **DevOps & Tools**: Docker, Git/GitHub, Nginx, Postman, Vercel, Render, Bash Scripting, SSH (MobaXterm).

- **Electrical Design & Simulation**: Cadence Virtuoso (SRAM design), Arduino IDE, CMOS Logic, RF Communication.


# Extracurricular
## Position of Responsibilities in college
- **Coordinator, Anime Club** – Hosted Animecon 2022 which was bihar's first animecon during anwesha 2022. And managed a footfall of 500+ people throughout the event while there were 2 rounds of ICPC Regional Contest on the same day.
- **Sub-Coordinator, E-Cell Industrial Relations** – Managed the StartIN event and stalls that earned a net profit of 30K+ rupees in 3 days.
- **Hostel Secretary (2023–24)** – Liaising and issue resolution of Kalam Hostel in IIT Patna. Including mess management. Managed repairs and Procurement of hostel amenities. Also Room allocation and Mess Food Quality Inspections.
- **Core Team Member (Aria -  Music Club)** – For piano performances during events.
## Hobbies
- Piano Player (Keyboards and Harmonium included)
- Sports (Badminton, Basketball)
- Relax (Anime, Manga, Manhwas)