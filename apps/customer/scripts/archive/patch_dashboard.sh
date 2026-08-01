#!/bin/bash
sed -i 's/{currentUser && <StreakTracker userId={currentUser.uid} isDark={isDark} \/>}/<div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-6 lg:gap-8">\n                {currentUser \&\& <StreakTracker userId={currentUser.uid} isDark={isDark} \/>}/' src/pages/Dashboard.tsx
sed -i 's/<DailyAffirmationWidget isDark={isDark} \/>/<DailyAffirmationWidget isDark={isDark} \/>\n              <\/div>/' src/pages/Dashboard.tsx
