#builder-planner

A react+Node.js web app that allow users to draw ,annote,edit,save and load building plans visually with shap tools and dimension annotation.

Features:
1)Draw tools:Line,Rectangel,Circle,
2)select and move shapes.
3)Annotate dimension.
4)save drawings to mongoDB.
5)Backend built wth express +MongoDB. 6)konva canvas fot vector-like drawing.

Tech Stack:
Frontend:React.js+konva. 
Backend:Node.js+Express.js. 
Database:MongoDB(Mongoose)


Setup instruction:
1. clone the repository: a)git clone b)cd client
2. install backend: a)cd server b)npm install
3. created a .env file in server folder
4. run the server nodemon server.js
5. install frontend a)npm install b)npm run dev
   
API END POINTS
POST : /api/drawings save a drawing
GET : /api/drawings get all drawings
GET: /api/drawings/:id load a drawing
