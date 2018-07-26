require(readr)
require(ggplot2)
require(lattice)
require(cluster)

#K MEANS Technique 

df <- read.table("http://www2.cs.uh.edu/~ml_kdd/restored/Complex&Diamond/Complex9_RN32.txt",header = FALSE, sep = ",")
xyplot(df$V1 ~ df$V2, xlab = "V1", ylab = "V2", df, groups = df$V3, pch = 20, auto.key = list(title = "Class", corner = c(1,1), x = 1, y = 1, cex = 1.0))
ols <- c()

n = 9;
set.seed(30)
clusters <- kmeans(df[1:2], n)
cl <- clusters$cluster


for (j in 1:n){
  vals1 <- c()
  vals2 <- c()
  p <- c()
  cen <- clusters$centers[j,]
  for (i in 1:length(cl)){
    if (cl[i] == j){
      vals1 <- c(vals1, df[i,1])
      vals2 <- c(vals2, df[i,2])
      p <- c(p, i)
    }
  }
  #find distances from the centroids
  d <- c()
  for (k in 1:length(p)){
    x <- p[k]
    y <- sqrt((cen[1]-vals1[k])^2+(cen[2]-vals2[k])^2)
    d <- c(d,y)
  }
  m <- max(d)
  d <- d/m * .95
  
  for (l in 1:length(d)){
    temp <- p[l]
    ols[temp] <- d[l]
  }
}

#append the ols column with the original dataset 
df <- cbind(df,ols)

#visualize results 
sorted_df <- df[order(df$ols, decreasing = T),]
a <- floor(length(cl)*.09)
out <- xyplot(sorted_df$V1[1:a] ~ sorted_df$V2[1:a], xlab = "V1", ylab = "V2", sorted_df, groups = sorted_df$V3, pch = 20)
scat <- xyplot(sorted_df$V1[a+1:3999] ~ sorted_df$V2[a+1:3999], xlab = "V1", ylab = "V2", sorted_df, groups = sorted_df$V3, pch = 20, auto.key = list(title = "Class", corner = c(1,1), x = 1, y = 1, cex = 1.0))
grid.arrange(out,scat, nrow = 1, top = "9% Display vs Original Dataset")

a <- floor(length(cl)*.18)
out <- xyplot(sorted_df$V1[1:a] ~ sorted_df$V2[1:a], xlab = "V1", ylab = "V2", sorted_df, groups = sorted_df$V3, pch = 20)
scat <- xyplot(sorted_df$V1[a+1:3999] ~ sorted_df$V2[a+1:3999], xlab = "V1", ylab = "V2", sorted_df, groups = sorted_df$V3, pch = 20, auto.key = list(title = "Class", corner = c(1,1), x = 1, y = 1, cex = 1.0))
grid.arrange(out,scat, nrow = 1, top = "18% Display vs Original Dataset")

a <- floor(length(cl)*.36)
out <- xyplot(sorted_df$V1[1:a] ~ sorted_df$V2[1:a], xlab = "V1", ylab = "V2", sorted_df, groups = sorted_df$V3, pch = 20)
scat <- xyplot(sorted_df$V1[a+1:3999] ~ sorted_df$V2[a+1:3999], xlab = "V1", ylab = "V2", sorted_df, groups = sorted_df$V3, pch = 20, auto.key = list(title = "Class", corner = c(1,1), x = 1, y = 1, cex = 1.0))
grid.arrange(out,scat, nrow = 1, top = "36% Display vs Original Dataset")

hist(sorted_df$ols[1:a], main = "OLS Scores of the top 36th Percentile", xlab = "OLS Score")

# DBSCAN Detection tecnique

# Importing Data Set
Complex9_RN32 <- read.table("Complex9_RN32.txt", sep = ",")
X = Complex9_RN32[, 1]
Y = Complex9_RN32[, 2]
class = as.factor(Complex9_RN32[, 3])

# Visualizing the data set
library("ggplot2")
plot1 <- ggplot(Complex9_RN32, aes(x = X, y = Y, color = class)) + geom_point()

# DBSCAN technique one
DBSCAN1<-fpc::dbscan(Complex9_RN32, eps=13, MinPts=8)
plot2 <- ggplot(Complex9_RN32, aes(x = X, y = Y, color = as.factor(DBSCAN1$cluster))) + geom_point()

# Distance function
distance <- function(x1, y1, x2, y2) {
  return(sqrt((x1-x2)**2 + (y1-y2)**2))
}

# assign distance values
assignValues <- function(df, dbCol) {
  for (i in 1:length(dbCol)) {
    if (dbCol[i] == 0) {
      distMin <- .Machine$double.max
      for (j in 1:length(dbCol)) {
        if (dbCol[j] != 0 && i!=j) {
          dist <- distance(df[j, 1], df[j, 2], df[i, 1], df[i, 2])
          if (dist < distMin) {
            distMin = dist
          }
        }
      }
      df[i, 4] = distMin
    } else {
      df[i, 4] = 0
    }
  }
  return(df)
}
dbscan_results = assignValues(Complex9_RN32, DBSCAN1$cluster)

# normalize the distances
dbscan_results[,4] = dbscan_results[, 4]/max(dbscan_results[,4])

# Assigning column names
colNames = c("X", "Y", "Class", "ols")
colnames(dbscan_results) <- colNames
